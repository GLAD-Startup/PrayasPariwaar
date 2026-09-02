export default function imageLoader({ src, width, quality }) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  const cleanSrc = src.startsWith("/") ? src : `/${src}`;
  if (cleanSrc.startsWith("/prayas/") || cleanSrc === "/prayas") {
    return cleanSrc;
  }
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH !== undefined && process.env.NEXT_PUBLIC_BASE_PATH !== ""
      ? process.env.NEXT_PUBLIC_BASE_PATH
      : "/prayas";

  const base = `${basePath}${cleanSrc}`;
  
  if (width) {
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}w=${width}&q=${quality || 75}`;
  }
  
  return base;
}


