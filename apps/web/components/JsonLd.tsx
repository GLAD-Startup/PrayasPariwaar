import React from "react";

interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Renders a safe, XSS-sanitized JSON-LD script element.
 * Replaces '<' with '\u003c' to prevent script breakouts or HTML injection.
 */
export default function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      hidden
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
