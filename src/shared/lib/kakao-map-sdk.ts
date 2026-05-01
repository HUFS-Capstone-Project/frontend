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
  setBounds: (bounds: KakaoLatLngBounds) => void;
  setLevel: (level: number) => void;
};

export type KakaoLatLngBounds = {
  extend: (position: KakaoLatLng) => void;
};

export type KakaoGeocodeResult = {
  x: string;
  y: string;
  place_name?: string;
  address_name?: string;
  road_address_name?: string;
};

export type KakaoGeocoder = {
  addressSearch: (
    keyword: string,
    callback: (results: KakaoGeocodeResult[], status: string) => void,
  ) => void;
};

export type KakaoPlaces = {
  keywordSearch: (
    keyword: string,
    callback: (results: KakaoGeocodeResult[], status: string) => void,
  ) => void;
};

export type KakaoServices = {
  Status: {
    OK: string;
  };
  Geocoder: new () => KakaoGeocoder;
  Places: new () => KakaoPlaces;
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

type KakaoEvent = {
  addListener: (
    target: KakaoMarker | KakaoMapInstance,
    eventName: string,
    handler: () => void,
  ) => void;
  removeListener: (
    target: KakaoMarker | KakaoMapInstance,
    eventName: string,
    handler: () => void,
  ) => void;
};

export type KakaoMaps = {
  load: (callback: () => void) => void;
  LatLng: new (latitude: number, longitude: number) => KakaoLatLng;
  LatLngBounds: new () => KakaoLatLngBounds;
  Size: new (width: number, height: number) => KakaoSize;
  Point: new (x: number, y: number) => KakaoPoint;
  Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
  MarkerImage: new (
    src: string,
    size: KakaoSize,
    options?: KakaoMarkerImageOptions,
  ) => KakaoMarkerImage;
  Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
  event: KakaoEvent;
  services?: KakaoServices;
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

function hasServicesLibrary(kakao: KakaoNamespace | undefined) {
  return Boolean(kakao?.maps.services);
}

function buildSdkScriptUrl(appKey: string) {
  const query = new URLSearchParams({
    appkey: appKey,
    libraries: "services",
    autoload: "false",
  });
  return `${KAKAO_MAP_SDK_URL}?${query.toString()}`;
}

function getOrCreateSdkScript(appKey: string) {
  const existingScript = document.getElementById(KAKAO_MAP_SCRIPT_ID);
  if (existingScript instanceof HTMLScriptElement) {
    const existingScriptUrl = new URL(existingScript.src);
    if (!existingScriptUrl.searchParams.get("libraries")?.includes("services")) {
      existingScript.remove();
      window.kakao = undefined;
    } else {
      return existingScript;
    }
  }

  const duplicatedScript = Array.from(document.scripts).find(
    (script) =>
      script.src.startsWith(KAKAO_MAP_SDK_URL) &&
      !new URL(script.src).searchParams.get("libraries")?.includes("services"),
  );
  if (duplicatedScript) {
    duplicatedScript.remove();
    window.kakao = undefined;
  }

  const existingServicesScript = document.getElementById(KAKAO_MAP_SCRIPT_ID);
  if (existingServicesScript instanceof HTMLScriptElement) {
    return existingServicesScript;
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
    if (!hasServicesLibrary(existingKakao)) {
      document.getElementById(KAKAO_MAP_SCRIPT_ID)?.remove();
      window.kakao = undefined;
      sdkLoadPromise = null;
    } else {
      return new Promise((resolve, reject) => {
        resolveKakaoMapsOrThrow(resolve, reject);
      });
    }
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
