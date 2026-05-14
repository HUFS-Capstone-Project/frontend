import { LocateFixed } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import {
  type KakaoMapInstance,
  type KakaoMaps,
  type KakaoMarker,
  type KakaoMarkerImage,
  loadKakaoMapSdk,
} from "@/shared/lib/kakao-map-sdk";
import type { MapCoordinate, SavedPlace } from "@/shared/types/map-home";
import { PLACE_DETAIL_OPEN_EVENT, usePlaceDetailStore } from "@/store/place-detail-store";

export type KakaoMapViewProps = {
  appKey?: string;
  places: SavedPlace[];
  center: MapCoordinate;
  fitBoundsPlaces?: SavedPlace[];
  geocodeKeyword?: string;
  viewportKey?: string;
  level?: number;
  className?: string;
  selectedPlaceId?: string | null;
  showCurrentLocationButton?: boolean;
  onMapClick?: () => void;
  onPlaceMarkerClick?: (place: SavedPlace) => void;
};

type MapLoadState = "loading" | "ready" | "error";

const FIT_BOUNDS_PADDING = {
  top: 120,
  right: 36,
  bottom: 140,
  left: 36,
} as const;

/**
 * Kakao JS SDK 로딩과 지도/마커 렌더링을 담당.
 * 현재는 단일 마커 스타일만 사용하고, 상세 오버레이는 연결하지 않는다.
 */
export function KakaoMapView({
  appKey,
  places,
  center,
  fitBoundsPlaces = [],
  geocodeKeyword = "",
  viewportKey = "initial",
  level = 4,
  className,
  selectedPlaceId: selectedPlaceIdOverride,
  showCurrentLocationButton = false,
  onMapClick,
  onPlaceMarkerClick,
}: KakaoMapViewProps) {
  const mapKey = appKey?.trim() ?? "";
  const hasMapKey = mapKey.length > 0;
  const initialCenterRef = useRef(center);
  const initialLevelRef = useRef(level);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const mapsRef = useRef<KakaoMaps | null>(null);
  const markerImageRef = useRef<KakaoMarkerImage | null>(null);
  const selectedMarkerImageRef = useRef<KakaoMarkerImage | null>(null);
  const markerInstancesRef = useRef<KakaoMarker[]>([]);
  const [loadState, setLoadState] = useState<MapLoadState>("loading");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const detailSelectedPlaceId = usePlaceDetailStore((state) =>
    state.isOpen ? state.selectedPlaceId : null,
  );
  const selectedPlaceId = selectedPlaceIdOverride ?? detailSelectedPlaceId;

  const clearMarkers = () => {
    markerInstancesRef.current.forEach((marker) => marker.setMap(null));
    markerInstancesRef.current = [];
  };

  // effect A: SDK 로드 + map 인스턴스 생성 (최초 1회)
  useEffect(() => {
    if (!hasMapKey) {
      return;
    }

    const mapContainer = mapContainerRef.current;
    if (!mapContainer) {
      return;
    }

    let disposed = false;

    loadKakaoMapSdk(mapKey)
      .then((kakao) => {
        if (disposed) return;
        if (mapRef.current) return;

        const mapInstance = new kakao.maps.Map(mapContainer, {
          center: new kakao.maps.LatLng(
            initialCenterRef.current.latitude,
            initialCenterRef.current.longitude,
          ),
          level: initialLevelRef.current,
        });
        mapInstance.setDraggable(true);

        mapsRef.current = kakao.maps;
        mapRef.current = mapInstance;
        markerImageRef.current = new kakao.maps.MarkerImage(
          "/assets/map-marker.svg",
          new kakao.maps.Size(26, 35),
          { offset: new kakao.maps.Point(13, 34) },
        );
        selectedMarkerImageRef.current = new kakao.maps.MarkerImage(
          "/assets/map-marker-selected.png",
          new kakao.maps.Size(36, 48),
          { offset: new kakao.maps.Point(18, 47) },
        );

        setLoadState("ready");
      })
      .catch(() => {
        if (disposed) return;
        setLoadState("error");
      });

    return () => {
      disposed = true;
      clearMarkers();
      mapRef.current = null;
      mapsRef.current = null;
      markerImageRef.current = null;
      selectedMarkerImageRef.current = null;
    };
  }, [hasMapKey, mapKey]);

  useEffect(() => {
    if (loadState !== "ready" || !mapRef.current || !mapsRef.current || !mapContainerRef.current) {
      return;
    }

    const mapContainer = mapContainerRef.current;
    const mapInstance = mapRef.current;
    const maps = mapsRef.current;
    let frameId: number | null = null;

    const relayoutMap = () => {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        mapInstance.relayout();
        mapInstance.setCenter(new maps.LatLng(center.latitude, center.longitude));
        frameId = null;
      });
    };

    relayoutMap();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(relayoutMap) : null;
    resizeObserver?.observe(mapContainer);
    window.addEventListener("resize", relayoutMap);

    return () => {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
      resizeObserver?.disconnect();
      window.removeEventListener("resize", relayoutMap);
    };
  }, [center.latitude, center.longitude, loadState]);

  // effect B: requested viewport changes.
  useEffect(() => {
    if (loadState !== "ready" || !mapRef.current || !mapsRef.current) return;
    const maps = mapsRef.current;
    const mapInstance = mapRef.current;

    if (fitBoundsPlaces.length > 1) {
      const bounds = new maps.LatLngBounds();
      fitBoundsPlaces.forEach((place) => {
        bounds.extend(new maps.LatLng(place.latitude, place.longitude));
      });
      mapInstance.setBounds(
        bounds,
        FIT_BOUNDS_PADDING.top,
        FIT_BOUNDS_PADDING.right,
        FIT_BOUNDS_PADDING.bottom,
        FIT_BOUNDS_PADDING.left,
      );
      return;
    }

    if (fitBoundsPlaces.length === 1) {
      const [place] = fitBoundsPlaces;
      mapInstance.setLevel(level);
      const position = new maps.LatLng(place.latitude, place.longitude);
      if (viewportKey.startsWith("pan-")) {
        mapInstance.panTo(position);
      } else {
        mapInstance.setCenter(position);
      }
      return;
    }

    const trimmedGeocodeKeyword = geocodeKeyword.trim();
    if (trimmedGeocodeKeyword && maps.services) {
      mapInstance.setLevel(level);
      let disposed = false;
      const normalizeResultText = (value: string | undefined) =>
        (value ?? "").trim().toLowerCase().replace(/\s+/g, "");
      const normalizedKeyword = normalizeResultText(trimmedGeocodeKeyword);
      const scoreResult = (result: {
        place_name?: string;
        address_name?: string;
        road_address_name?: string;
      }) => {
        const texts = [
          normalizeResultText(result.place_name),
          normalizeResultText(result.address_name),
          normalizeResultText(result.road_address_name),
        ];

        if (texts.some((text) => text === normalizedKeyword)) return 0;
        if (texts.some((text) => text.includes(normalizedKeyword))) return 1;
        if (texts.some((text) => normalizedKeyword.includes(text) && text.length > 0)) return 2;
        return 3;
      };
      const moveToBestResult = (
        results: Array<{
          x: string;
          y: string;
          place_name?: string;
          address_name?: string;
          road_address_name?: string;
        }>,
      ) => {
        const [result] = [...results].sort((a, b) => scoreResult(a) - scoreResult(b));
        const latitude = Number(result?.y);
        const longitude = Number(result?.x);
        if (disposed || Number.isNaN(latitude) || Number.isNaN(longitude)) {
          return false;
        }

        mapInstance.setCenter(new maps.LatLng(latitude, longitude));
        return true;
      };
      const moveToFallbackCenter = () => {
        if (!disposed) {
          mapInstance.setCenter(new maps.LatLng(center.latitude, center.longitude));
        }
      };

      const services = maps.services;
      const geocoder = new services.Geocoder();
      geocoder.addressSearch(trimmedGeocodeKeyword, (addressResults, addressStatus) => {
        if (disposed) {
          return;
        }

        if (addressStatus === services.Status.OK && moveToBestResult(addressResults)) {
          return;
        }

        const places = new services.Places();
        places.keywordSearch(trimmedGeocodeKeyword, (keywordResults, keywordStatus) => {
          if (keywordStatus === services.Status.OK && moveToBestResult(keywordResults)) {
            return;
          }

          moveToFallbackCenter();
        });
      });

      return () => {
        disposed = true;
      };
    }

    mapInstance.setLevel(level);
    mapInstance.setCenter(new maps.LatLng(center.latitude, center.longitude));
  }, [
    center.latitude,
    center.longitude,
    fitBoundsPlaces,
    geocodeKeyword,
    level,
    loadState,
    viewportKey,
  ]);

  useEffect(() => {
    if (loadState !== "ready" || !mapRef.current || !mapsRef.current || !onMapClick) return;

    const maps = mapsRef.current;
    const mapInstance = mapRef.current;
    maps.event.addListener(mapInstance, "click", onMapClick);

    return () => {
      maps.event.removeListener(mapInstance, "click", onMapClick);
    };
  }, [loadState, onMapClick]);

  const handleMoveToCurrentLocation = useCallback(() => {
    if (loadState !== "ready" || !mapRef.current || !mapsRef.current || isLocating) {
      return;
    }

    if (!("geolocation" in navigator)) {
      setLocationError("현재 위치를 확인할 수 없어요.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const maps = mapsRef.current;
        const mapInstance = mapRef.current;
        if (!maps || !mapInstance) {
          setIsLocating(false);
          return;
        }

        const currentPosition = new maps.LatLng(
          position.coords.latitude,
          position.coords.longitude,
        );
        mapInstance.setLevel(level);
        mapInstance.panTo(currentPosition);
        setIsLocating(false);
      },
      () => {
        setLocationError("현재 위치를 확인할 수 없어요.");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 8_000,
      },
    );
  }, [isLocating, level, loadState]);

  useEffect(() => {
    if (!locationError) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLocationError(null);
    }, 2_500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [locationError]);

  // effect C: places 변경 시 marker만 갱신
  useEffect(() => {
    if (
      loadState !== "ready" ||
      !mapRef.current ||
      !mapsRef.current ||
      !markerImageRef.current ||
      !selectedMarkerImageRef.current
    ) {
      return;
    }
    const maps = mapsRef.current;
    const mapInstance = mapRef.current;
    const markerImage = markerImageRef.current;
    const selectedMarkerImage = selectedMarkerImageRef.current;

    clearMarkers();
    markerInstancesRef.current = places.map((place) => {
      const marker = new maps.Marker({
        map: mapInstance,
        title: place.name,
        position: new maps.LatLng(place.latitude, place.longitude),
        image: place.id === selectedPlaceId ? selectedMarkerImage : markerImage,
      });

      maps.event.addListener(marker, "click", () => {
        mapInstance.panTo(new maps.LatLng(place.latitude, place.longitude));
        if (onPlaceMarkerClick) {
          onPlaceMarkerClick(place);
          return;
        }
        window.dispatchEvent(
          new CustomEvent(PLACE_DETAIL_OPEN_EVENT, {
            detail: { placeId: place.id },
          }),
        );
      });

      return marker;
    });

    return () => {
      clearMarkers();
    };
  }, [loadState, onPlaceMarkerClick, places, selectedPlaceId]);

  return (
    <div className={cn("bg-muted relative h-full w-full", className)}>
      <div ref={mapContainerRef} className="relative z-0 h-full w-full" />

      {hasMapKey && loadState === "loading" ? (
        <div className="bg-background/30 pointer-events-none absolute inset-0" aria-hidden />
      ) : null}

      {!hasMapKey || loadState === "error" ? (
        <div className="bg-background/95 border-border-subtle absolute inset-x-4 top-4 rounded-xl border p-3 text-xs shadow-sm">
          <p className="font-semibold">지도를 불러오지 못했어요.</p>
          <p className="text-muted-foreground mt-1 leading-4">
            `.env.*`에 `VITE_KAKAO_MAP_APP_KEY`를 설정하면 Kakao 지도가 표시됩니다.
          </p>
        </div>
      ) : null}

      {showCurrentLocationButton && hasMapKey && loadState !== "error" ? (
        <div className="pointer-events-none absolute right-[max(1rem,env(safe-area-inset-right))] bottom-[calc(max(0.5rem,env(safe-area-inset-bottom))+4.25rem)] z-10 flex flex-col items-end gap-2">
          {locationError ? (
            <div className="bg-background/95 border-border-subtle rounded-full border px-3 py-2 text-xs font-medium text-black/65 shadow-sm">
              {locationError}
            </div>
          ) : null}
          <button
            type="button"
            className="text-muted-foreground/85 shadow-floating bg-background hover:bg-background/95 active:bg-muted pointer-events-auto inline-flex size-12 items-center justify-center rounded-full border border-black/5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="현재 위치로 이동"
            aria-busy={isLocating}
            disabled={loadState !== "ready" || isLocating}
            onClick={handleMoveToCurrentLocation}
          >
            <LocateFixed
              className={cn("size-5", isLocating && "animate-pulse")}
              strokeWidth={1.75}
              aria-hidden
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}
