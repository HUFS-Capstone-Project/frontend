import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import {
  type KakaoMapInstance,
  type KakaoMaps,
  type KakaoMarker,
  type KakaoMarkerImage,
  loadKakaoMapSdk,
} from "@/shared/lib/kakao-map-sdk";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
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
  onMapClick?: () => void;
};

type MapLoadState = "loading" | "ready" | "error";

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
  onMapClick,
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
  const selectedPlaceId = usePlaceDetailStore((state) =>
    state.isOpen ? state.selectedPlaceId : null,
  );

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

        mapsRef.current = kakao.maps;
        mapRef.current = mapInstance;
        markerImageRef.current = new kakao.maps.MarkerImage(
          "/assets/map-marker.svg",
          new kakao.maps.Size(30, 40),
          { offset: new kakao.maps.Point(15, 39) },
        );
        selectedMarkerImageRef.current = new kakao.maps.MarkerImage(
          "/assets/map-marker-selected.png",
          new kakao.maps.Size(42, 56),
          { offset: new kakao.maps.Point(21, 55) },
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
      mapInstance.setBounds(bounds);
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
      const detailPlaceId = resolveMockDetailPlaceId(place);
      const marker = new maps.Marker({
        map: mapInstance,
        title: place.name,
        position: new maps.LatLng(place.latitude, place.longitude),
        image:
          place.id === selectedPlaceId || detailPlaceId === selectedPlaceId
            ? selectedMarkerImage
            : markerImage,
      });

      maps.event.addListener(marker, "click", () => {
        mapInstance.panTo(new maps.LatLng(place.latitude, place.longitude));
        window.dispatchEvent(
          new CustomEvent(PLACE_DETAIL_OPEN_EVENT, {
            detail: { placeId: detailPlaceId },
          }),
        );
      });

      return marker;
    });

    return () => {
      clearMarkers();
    };
  }, [loadState, places, selectedPlaceId]);

  return (
    <div className={cn("bg-map-placeholder-bg relative h-full w-full", className)}>
      <div ref={mapContainerRef} className="relative z-0 h-full w-full [touch-action:none]" />

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
    </div>
  );
}

function resolveMockDetailPlaceId(place: SavedPlace): string {
  if (SAVED_PLACE_MOCKS.some((mock) => mock.id === place.id)) {
    return place.id;
  }

  const normalizedName = normalizePlaceText(place.name);
  const normalizedAddress = normalizePlaceText(place.address);
  const textMatched = SAVED_PLACE_MOCKS.find(
    (mock) =>
      normalizePlaceText(mock.name) === normalizedName ||
      normalizePlaceText(mock.address) === normalizedAddress,
  );
  if (textMatched) {
    return textMatched.id;
  }

  const nearest = SAVED_PLACE_MOCKS.reduce(
    (best, mock) => {
      const distance =
        Math.abs(mock.latitude - place.latitude) + Math.abs(mock.longitude - place.longitude);
      return distance < best.distance ? { id: mock.id, distance } : best;
    },
    { id: SAVED_PLACE_MOCKS[0]?.id ?? place.id, distance: Number.POSITIVE_INFINITY },
  );

  return nearest.id;
}

function normalizePlaceText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}
