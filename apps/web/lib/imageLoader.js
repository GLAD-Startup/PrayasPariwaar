export default function imageLoader({ src, width, quality }) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  const cleanSrc = src.startsWith("/") ? src : `/${src}`;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const base = basePath && !cleanSrc.startsWith(basePath) ? `${basePath}${cleanSrc}` : cleanSrc;
  
  if (width) {
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}w=${width}&q=${quality || 75}`;
  }
  
  return base;
}


