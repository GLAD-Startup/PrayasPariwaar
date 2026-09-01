export default function imageLoader({ src, width, quality }) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  const cleanSrc = src.startsWith("/") ? src : `/${src}`;
  if (cleanSrc.startsWith("/prayas")) {
    return cleanSrc;
  }
  return `/prayas${cleanSrc}`;
}
