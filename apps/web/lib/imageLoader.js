export default function imageLoader({ src, width, quality }) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  const cleanSrc = src.startsWith("/") ? src : `/${src}`;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (!basePath) {
    return cleanSrc;
  }
  if (cleanSrc.startsWith(basePath)) {
    return cleanSrc;
  }
  return `${basePath}${cleanSrc}`;
}

