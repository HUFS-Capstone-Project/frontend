const KAKAO_MAP_SDK_URL = "https://dapi.kakao.com/v2/maps/sdk.js";
const KAKAO_MAP_SCRIPT_ID = "kakao-map-javascript-sdk";

export type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

export type KakaoSize = {
  readonly __kakaoSizeBrand?: never;
};

export type KakaoPoint = {
  readonly __kakaoPointBrand?: never;
};

export type KakaoMarkerImage = {
  readonly __kakaoMarkerImageBrand?: never;
};

export type KakaoMapInstance = {
  setCenter: (position: KakaoLatLng) => void;
};

type KakaoMapOptions = {
  center: KakaoLatLng;
  level: number;
};

type KakaoMarkerImageOptions = {
  offset?: KakaoPoint;
};

type KakaoMarkerOptions = {
  map: KakaoMapInstance;
  position: KakaoLatLng;
  title?: string;
  image?: KakaoMarkerImage;
};

export type KakaoMarker = {
  setMap: (map: KakaoMapInstance | null) => void;
};

export type KakaoMaps = {
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  Size: new (width: number, height: number) => KakaoSize;
  Point: new (x: number, y: number) => KakaoPoint;
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
  MarkerImage: new (
    src: string,
    size: KakaoSize,
    options?: KakaoMarkerImageOptions,
  ) => KakaoMarkerImage;
  Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
};

export type KakaoNamespace = {
  maps: KakaoMaps;
};

declare global {
  interface Window {
    kakao?: KakaoNamespace;
  }
}

let sdkLoadPromise: Promise<KakaoNamespace> | null = null;

function getWindowKakao() {
  return window.kakao;
}

function buildSdkScriptUrl(appKey: string) {
  const query = new URLSearchParams({
    appkey: appKey,
    autoload: "false",
  });
  return `${KAKAO_MAP_SDK_URL}?${query.toString()}`;
}

function getOrCreateSdkScript(appKey: string) {
  const existingScript = document.getElementById(KAKAO_MAP_SCRIPT_ID);
  if (existingScript instanceof HTMLScriptElement) {
    return existingScript;
  }

  const script = document.createElement("script");
  script.id = KAKAO_MAP_SCRIPT_ID;
  script.src = buildSdkScriptUrl(appKey);
  script.async = true;
  document.head.append(script);
  return script;
}

function resolveKakaoMapsOrThrow(
  resolve: (value: KakaoNamespace) => void,
  reject: (reason: unknown) => void,
) {
  const kakao = getWindowKakao();
  if (!kakao?.maps) {
    sdkLoadPromise = null;
    reject(new Error("Kakao Maps SDK load failed: window.kakao.maps not found"));
    return;
  }

  kakao.maps.load(() => resolve(kakao));
}

export function loadKakaoMapSdk(appKey: string): Promise<KakaoNamespace> {
  if (!appKey.trim()) {
    return Promise.reject(new Error("Kakao Maps app key is missing"));
  }

  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao Maps SDK can only be loaded in browser"));
  }

  const existingKakao = getWindowKakao();
  if (existingKakao?.maps) {
    return new Promise((resolve, reject) => {
      resolveKakaoMapsOrThrow(resolve, reject);
    });
  }

  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  sdkLoadPromise = new Promise<KakaoNamespace>((resolve, reject) => {
    const script = getOrCreateSdkScript(appKey);
    const handleLoad = () => {
      script.dataset.loaded = "true";
      resolveKakaoMapsOrThrow(resolve, reject);
    };
    const handleError = () => {
      sdkLoadPromise = null;
      reject(new Error("Kakao Maps SDK script failed to load"));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (script.dataset.loaded === "true" || getWindowKakao()?.maps) {
      handleLoad();
    }
  });

  return sdkLoadPromise;
}
