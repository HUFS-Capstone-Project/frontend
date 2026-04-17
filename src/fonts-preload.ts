import notoSansLatin from "@fontsource-variable/noto-sans/files/noto-sans-latin-wght-normal.woff2?url";
import notoKrHangul from "@fontsource-variable/noto-sans-kr/files/noto-sans-kr-119-wght-normal.woff2?url";
import notoKrLatin from "@fontsource-variable/noto-sans-kr/files/noto-sans-kr-latin-wght-normal.woff2?url";

for (const href of [notoKrHangul, notoKrLatin, notoSansLatin]) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = href;
  link.as = "font";
  link.type = "font/woff2";
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}
