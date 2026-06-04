import { LocateFixed } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import {
  type KakaoCustomOverlay,
  type KakaoMapInstance,
  type KakaoMaps,
  type KakaoPolyline,
  loadKakaoMapSdk,
} from "@/shared/lib/kakao-map-sdk";
import type { MapCoordinate, SavedPlace } from "@/shared/types/map-home";
import { PLACE_DETAIL_OPEN_EVENT, usePlaceDetailStore } from "@/store/place-detail-store";

export type KakaoMapViewProps = {
  appKey?: string;
  places: SavedPlace[];
  center: MapCoordinate;
  fitBoundsPlaces?: SavedPlace[];
  fitBoundsCoordinates?: MapCoordinate[];
  routeCoordinates?: MapCoordinate[];
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

type PlaceCluster = {
  id: string;
  places: SavedPlace[];
  latitude: number;
  longitude: number;
};

type PlaceMarkerItem =
  | {
      type: "place";
      place: SavedPlace;
      selected: boolean;
    }
  | {
      type: "cluster";
      cluster: PlaceCluster;
    };

const FIT_BOUNDS_PADDING = {
  top: 120,
  right: 36,
  bottom: 140,
  left: 36,
} as const;

const FIT_COORDINATE_BOUNDS_PADDING = {
  top: 56,
  right: 16,
  bottom: 24,
  left: 16,
} as const;

const CLUSTER_MIN_SIZE = 3;
const CLUSTER_DETAIL_LEVEL = 3;
const CLUSTER_BASE_RADIUS_METERS = 140;
const PLACE_MARKER_CATEGORY_CODES = ["FOOD", "CAFE", "ACTIVITY"] as const;

type PlaceMarkerCategoryCode = (typeof PLACE_MARKER_CATEGORY_CODES)[number];

/**
 * Kakao JS SDK 로딩과 지도/마커 렌더링을 담당.
 * 현재는 단일 마커 스타일만 사용하고, 상세 오버레이는 연결하지 않는다.
 */
export function KakaoMapView({
  appKey,
  places,
  center,
  fitBoundsPlaces = [],
  fitBoundsCoordinates = [],
  routeCoordinates = [],
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
  const placeOverlayInstancesRef = useRef<KakaoCustomOverlay[]>([]);
  const clusterOverlayInstancesRef = useRef<KakaoCustomOverlay[]>([]);
  const routePolylineRef = useRef<KakaoPolyline | null>(null);
  const onPlaceMarkerClickRef = useRef(onPlaceMarkerClick);
  const [loadState, setLoadState] = useState<MapLoadState>("loading");
  const [currentMapLevel, setCurrentMapLevel] = useState(level);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const detailSelectedPlaceId = usePlaceDetailStore((state) =>
    state.isOpen ? state.selectedPlaceId : null,
  );
  const selectedPlaceId = selectedPlaceIdOverride ?? detailSelectedPlaceId;
  const markerItems = useMemo(
    () => buildPlaceMarkerItems(places, selectedPlaceId, currentMapLevel),
    [currentMapLevel, places, selectedPlaceId],
  );

  useEffect(() => {
    onPlaceMarkerClickRef.current = onPlaceMarkerClick;
  }, [onPlaceMarkerClick]);

  const clearMarkers = () => {
    placeOverlayInstancesRef.current.forEach((overlay) => overlay.setMap(null));
    placeOverlayInstancesRef.current = [];
    clusterOverlayInstancesRef.current.forEach((overlay) => overlay.setMap(null));
    clusterOverlayInstancesRef.current = [];
  };

  const clearRoutePolyline = () => {
    routePolylineRef.current?.setMap(null);
    routePolylineRef.current = null;
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
        setCurrentMapLevel(mapInstance.getLevel());

        setLoadState("ready");
      })
      .catch(() => {
        if (disposed) return;
        setLoadState("error");
      });

    return () => {
      disposed = true;
      clearMarkers();
      clearRoutePolyline();
      mapRef.current = null;
      mapsRef.current = null;
    };
  }, [hasMapKey, mapKey]);

  useEffect(() => {
    if (loadState !== "ready" || !mapRef.current || !mapsRef.current) return;

    const maps = mapsRef.current;
    const mapInstance = mapRef.current;
    let frameId: number | null = null;
    const updateCurrentLevel = () => {
      if (frameId != null) {
        return;
      }

      frameId = requestAnimationFrame(() => {
        const nextLevel = mapInstance.getLevel();
        setCurrentMapLevel((previousLevel) =>
          previousLevel === nextLevel ? previousLevel : nextLevel,
        );
        frameId = null;
      });
    };

    setCurrentMapLevel((previousLevel) => {
      const nextLevel = mapInstance.getLevel();
      return previousLevel === nextLevel ? previousLevel : nextLevel;
    });
    maps.event.addListener(mapInstance, "zoom_changed", updateCurrentLevel);

    return () => {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
      maps.event.removeListener(mapInstance, "zoom_changed", updateCurrentLevel);
    };
  }, [loadState]);

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

    const shouldFitCoordinateBounds = fitBoundsCoordinates.length > 0;
    const fitBoundsTargets = shouldFitCoordinateBounds ? fitBoundsCoordinates : fitBoundsPlaces;
    const fitBoundsPadding = shouldFitCoordinateBounds
      ? FIT_COORDINATE_BOUNDS_PADDING
      : FIT_BOUNDS_PADDING;

    if (fitBoundsTargets.length > 1) {
      const bounds = new maps.LatLngBounds();
      fitBoundsTargets.forEach((coordinate) => {
        bounds.extend(new maps.LatLng(coordinate.latitude, coordinate.longitude));
      });
      mapInstance.setBounds(
        bounds,
        fitBoundsPadding.top,
        fitBoundsPadding.right,
        fitBoundsPadding.bottom,
        fitBoundsPadding.left,
      );
      return;
    }

    if (fitBoundsTargets.length === 1) {
      const [coordinate] = fitBoundsTargets;
      mapInstance.setLevel(level);
      const position = new maps.LatLng(coordinate.latitude, coordinate.longitude);
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
    fitBoundsCoordinates,
    fitBoundsPlaces,
    geocodeKeyword,
    level,
    loadState,
    viewportKey,
  ]);

  useEffect(() => {
    if (loadState !== "ready" || !mapRef.current || !mapsRef.current) {
      return;
    }

    const maps = mapsRef.current;
    const mapInstance = mapRef.current;
    const path = routeCoordinates
      .filter((coordinate) => isFiniteCoordinate(coordinate))
      .map((coordinate) => new maps.LatLng(coordinate.latitude, coordinate.longitude));

    clearRoutePolyline();

    if (path.length < 2) {
      return;
    }

    routePolylineRef.current = new maps.Polyline({
      map: mapInstance,
      path,
      strokeWeight: 4,
      strokeColor: "#f06f6b",
      strokeOpacity: 0.88,
      strokeStyle: "solid",
    });

    return () => {
      clearRoutePolyline();
    };
  }, [loadState, routeCoordinates]);

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
    if (loadState !== "ready" || !mapRef.current || !mapsRef.current) {
      return;
    }
    const maps = mapsRef.current;
    const mapInstance = mapRef.current;

    clearMarkers();
    const nextPlaceOverlays: KakaoCustomOverlay[] = [];
    const nextClusterOverlays: KakaoCustomOverlay[] = [];

    markerItems.forEach((item) => {
      if (item.type === "cluster") {
        const { cluster } = item;
        const position = new maps.LatLng(cluster.latitude, cluster.longitude);
        const content = createClusterOverlayElement(cluster.places.length, () => {
          mapInstance.setLevel(Math.max(CLUSTER_DETAIL_LEVEL, mapInstance.getLevel() - 2));
          mapInstance.panTo(position);
        });
        const overlay = new maps.CustomOverlay({
          map: mapInstance,
          position,
          content,
          xAnchor: 0.5,
          yAnchor: 0.5,
          zIndex: 20,
        });

        nextClusterOverlays.push(overlay);
        return;
      }

      const { place } = item;
      const isSelectedPlace = item.selected;
      const position = new maps.LatLng(place.latitude, place.longitude);
      const content = createPlaceMarkerOverlayElement(place, isSelectedPlace, (element) => {
        element.classList.add("map-place-marker--selected");
        mapInstance.panTo(position);
        const handlePlaceMarkerClick = onPlaceMarkerClickRef.current;
        if (handlePlaceMarkerClick) {
          handlePlaceMarkerClick(place);
          return;
        }
        window.dispatchEvent(
          new CustomEvent(PLACE_DETAIL_OPEN_EVENT, {
            detail: { placeId: place.id },
          }),
        );
      });
      const overlay = new maps.CustomOverlay({
        map: mapInstance,
        position,
        content,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: isSelectedPlace ? 15 : 10,
      });

      nextPlaceOverlays.push(overlay);
    });

    placeOverlayInstancesRef.current = nextPlaceOverlays;
    clusterOverlayInstancesRef.current = nextClusterOverlays;

    return () => {
      clearMarkers();
    };
  }, [loadState, markerItems]);

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

function isFiniteCoordinate(coordinate: MapCoordinate): boolean {
  return Number.isFinite(coordinate.latitude) && Number.isFinite(coordinate.longitude);
}

function buildPlaceMarkerItems(
  places: SavedPlace[],
  selectedPlaceId: string | null,
  mapLevel: number,
): PlaceMarkerItem[] {
  const finitePlaces = places.filter((place) => isFiniteCoordinate(place));
  const selectedPlaces = finitePlaces.filter((place) => place.id === selectedPlaceId);
  const clusterablePlaces = finitePlaces.filter((place) => place.id !== selectedPlaceId);

  if (mapLevel <= CLUSTER_DETAIL_LEVEL || clusterablePlaces.length < CLUSTER_MIN_SIZE) {
    return finitePlaces.map((place) => ({
      type: "place",
      place,
      selected: place.id === selectedPlaceId,
    }));
  }

  const radiusMeters = getClusterRadiusMeters(mapLevel);
  const clusters: PlaceCluster[] = [];

  clusterablePlaces.forEach((place) => {
    const nearestCluster = findNearestCluster(clusters, place, radiusMeters);

    if (!nearestCluster) {
      clusters.push({
        id: place.id,
        places: [place],
        latitude: place.latitude,
        longitude: place.longitude,
      });
      return;
    }

    const nextPlaces = [...nearestCluster.places, place];
    nearestCluster.places = nextPlaces;
    nearestCluster.latitude =
      nextPlaces.reduce((sum, clusterPlace) => sum + clusterPlace.latitude, 0) / nextPlaces.length;
    nearestCluster.longitude =
      nextPlaces.reduce((sum, clusterPlace) => sum + clusterPlace.longitude, 0) / nextPlaces.length;
  });

  return [
    ...clusters.flatMap((cluster): PlaceMarkerItem[] =>
      cluster.places.length >= CLUSTER_MIN_SIZE
        ? [{ type: "cluster", cluster }]
        : cluster.places.map((place) => ({ type: "place", place, selected: false })),
    ),
    ...selectedPlaces.map((place): PlaceMarkerItem => ({ type: "place", place, selected: true })),
  ];
}

function findNearestCluster(
  clusters: PlaceCluster[],
  place: SavedPlace,
  radiusMeters: number,
): PlaceCluster | null {
  let nearestCluster: PlaceCluster | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  clusters.forEach((cluster) => {
    const distance = getDistanceMeters(place, cluster);
    if (distance <= radiusMeters && distance < nearestDistance) {
      nearestCluster = cluster;
      nearestDistance = distance;
    }
  });

  return nearestCluster;
}

function getClusterRadiusMeters(mapLevel: number): number {
  const zoomOutSteps = Math.max(0, mapLevel - 4);
  return CLUSTER_BASE_RADIUS_METERS * 2 ** zoomOutSteps;
}

function getDistanceMeters(
  a: Pick<MapCoordinate, "latitude" | "longitude">,
  b: Pick<MapCoordinate, "latitude" | "longitude">,
): number {
  const earthRadiusMeters = 6_371_000;
  const lat1 = degreesToRadians(a.latitude);
  const lat2 = degreesToRadians(b.latitude);
  const deltaLat = degreesToRadians(b.latitude - a.latitude);
  const deltaLng = degreesToRadians(b.longitude - a.longitude);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function createPlaceMarkerOverlayElement(
  place: SavedPlace,
  selected: boolean,
  onClick: (element: HTMLElement) => void,
): HTMLElement {
  const button = document.createElement("button");
  const defaultImage = document.createElement("img");
  const selectedImage = document.createElement("img");
  const categoryBadge = createPlaceMarkerCategoryBadge(place);

  button.type = "button";
  button.className = "map-place-marker";
  button.setAttribute("aria-label", place.name);

  defaultImage.src = "/assets/map-marker.svg";
  defaultImage.alt = "";
  defaultImage.draggable = false;
  defaultImage.className = "map-place-marker__image map-place-marker__image--default";

  selectedImage.src = "/assets/map-marker-selected.png";
  selectedImage.alt = "";
  selectedImage.draggable = false;
  selectedImage.className = "map-place-marker__image map-place-marker__image--selected";

  if (categoryBadge) {
    button.append(defaultImage, selectedImage, categoryBadge);
  } else {
    button.append(defaultImage, selectedImage);
  }
  if (selected) {
    requestAnimationFrame(() => {
      button.classList.add("map-place-marker--selected");
    });
  }
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick(button);
  });

  return button;
}

function createPlaceMarkerCategoryBadge(place: SavedPlace): HTMLElement | null {
  const category = getPlaceMarkerCategoryCode(place);
  if (!category) {
    return null;
  }

  const badge = document.createElement("span");
  badge.className = `map-place-marker__category-badge map-place-marker__category-badge--${category.toLowerCase()}`;
  badge.setAttribute("aria-hidden", "true");
  badge.append(createPlaceMarkerCategoryIcon(category));

  return badge;
}

function getPlaceMarkerCategoryCode(place: SavedPlace): PlaceMarkerCategoryCode | null {
  const category = place.category.trim().toUpperCase();
  if (isPlaceMarkerCategoryCode(category)) {
    return category;
  }

  const categoryName = place.categoryName?.trim().toUpperCase() ?? "";
  return isPlaceMarkerCategoryCode(categoryName) ? categoryName : null;
}

function isPlaceMarkerCategoryCode(value: string): value is PlaceMarkerCategoryCode {
  return PLACE_MARKER_CATEGORY_CODES.includes(value as PlaceMarkerCategoryCode);
}

function createPlaceMarkerCategoryIcon(category: PlaceMarkerCategoryCode): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const fill = getPlaceMarkerCategoryIconFill(category);

  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", fill.color);
  svg.setAttribute("fill-opacity", fill.opacity);
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2.3");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.classList.add("map-place-marker__category-icon");

  getPlaceMarkerCategoryIconPaths(category).forEach((pathData) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    svg.append(path);
  });

  return svg;
}

function getPlaceMarkerCategoryIconFill(category: PlaceMarkerCategoryCode): {
  color: string;
  opacity: string;
} {
  switch (category) {
    case "FOOD":
      return { color: "#f3f4f6", opacity: "0.65" };
    case "CAFE":
      return { color: "currentColor", opacity: "0.2" };
    case "ACTIVITY":
      return { color: "currentColor", opacity: "0.35" };
  }
}

function getPlaceMarkerCategoryIconPaths(category: PlaceMarkerCategoryCode): string[] {
  switch (category) {
    case "FOOD":
      return [
        "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2",
        "M7 2v20",
        "M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7",
      ];
    case "CAFE":
      return [
        "M10 2v2",
        "M14 2v2",
        "M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",
        "M6 2v2",
      ];
    case "ACTIVITY":
      return [
        "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
        "M20 3v4",
        "M22 5h-4",
        "M4 17v2",
        "M5 18H3",
      ];
  }
}

function createClusterOverlayElement(count: number, onClick: () => void): HTMLElement {
  const size = getClusterMarkerSize(count);
  const label = count > 999 ? "999+" : String(count);
  const button = document.createElement("button");
  const body = document.createElement("span");
  const countLabel = document.createElement("span");
  const shine = document.createElement("span");
  const badge = document.createElement("span");
  const heart = document.createElement("span");

  button.type = "button";
  button.setAttribute("aria-label", `${count} places`);
  button.className = "map-place-cluster";
  button.style.setProperty("--cluster-size", `${size}px`);
  button.style.setProperty("--cluster-count-size", getClusterCountFontSize(count));

  body.className = "map-place-cluster__body";

  countLabel.className = "map-place-cluster__count";
  countLabel.textContent = label;

  shine.className = "map-place-cluster__shine";
  shine.setAttribute("aria-hidden", "true");

  badge.className = "map-place-cluster__badge";
  badge.setAttribute("aria-hidden", "true");

  heart.className = "map-place-cluster__heart";
  heart.setAttribute("aria-hidden", "true");

  badge.append(heart);
  body.append(shine, countLabel);
  button.append(body, badge);

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  return button;
}

function getClusterMarkerSize(count: number): number {
  if (count >= 100) return 60;
  if (count >= 50) return 58;
  if (count >= 10) return 54;
  return 48;
}

function getClusterCountFontSize(count: number): string {
  if (count >= 100) return "1.35rem";
  if (count >= 10) return "1.55rem";
  return "1.45rem";
}
