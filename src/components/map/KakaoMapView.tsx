import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import {
  type KakaoMapInstance,
  type KakaoMaps,
  type KakaoMarker,
  type KakaoMarkerImage,
  loadKakaoMapSdk,
} from "@/shared/lib/kakao-map-sdk";
import type { MapCoordinate, SavedPlace } from "@/shared/types/map-home";

export type KakaoMapViewProps = {
  appKey?: string;
  places: SavedPlace[];
  center: MapCoordinate;
  level?: number;
  className?: string;
};

type MapLoadState = "loading" | "ready" | "error";

/**
 * Kakao JS SDK 로딩과 지도/마커 렌더링을 담당.
 * 현재는 단일 마커 스타일만 사용하고, 상세 오버레이는 연결하지 않는다.
 */
export function KakaoMapView({ appKey, places, center, level = 4, className }: KakaoMapViewProps) {
  const mapKey = appKey?.trim() ?? "";
  const hasMapKey = mapKey.length > 0;
  const initialCenterRef = useRef(center);
  const initialLevelRef = useRef(level);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const mapsRef = useRef<KakaoMaps | null>(null);
  const markerImageRef = useRef<KakaoMarkerImage | null>(null);
  const markerInstancesRef = useRef<KakaoMarker[]>([]);
  const [loadState, setLoadState] = useState<MapLoadState>("loading");

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
    };
  }, [hasMapKey, mapKey]);

  // effect B: center 변경 시 setCenter만 수행
  useEffect(() => {
    if (loadState !== "ready" || !mapRef.current || !mapsRef.current) return;
    const maps = mapsRef.current;
    const mapInstance = mapRef.current;
    const nextCenter = new maps.LatLng(center.latitude, center.longitude);
    mapInstance.setCenter(nextCenter);
  }, [center.latitude, center.longitude, loadState]);

  // effect C: places 변경 시 marker만 갱신
  useEffect(() => {
    if (loadState !== "ready" || !mapRef.current || !mapsRef.current || !markerImageRef.current) {
      return;
    }
    const maps = mapsRef.current;
    const mapInstance = mapRef.current;
    const markerImage = markerImageRef.current;

    clearMarkers();
    markerInstancesRef.current = places.map((place) => {
      return new maps.Marker({
        map: mapInstance,
        title: place.name,
        position: new maps.LatLng(place.latitude, place.longitude),
        image: markerImage,
      });
    });

    return () => {
      clearMarkers();
    };
  }, [loadState, places]);

  return (
    <div className={cn("bg-map-placeholder-bg relative h-full w-full", className)}>
      <div
        ref={mapContainerRef}
        className="relative z-0 h-full w-full [touch-action:pan-x_pan-y]"
      />

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
