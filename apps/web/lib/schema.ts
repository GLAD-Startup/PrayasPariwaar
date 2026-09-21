export const CANONICAL_BASE_URL = "https://prayaspariwaar.com";
export const ORGANIZATION_ID = `${CANONICAL_BASE_URL}/#organization`;
export const WEBSITE_ID = `${CANONICAL_BASE_URL}/#website`;
export const LOGO_ID = `${CANONICAL_BASE_URL}/#logo`;
export const LOGO_URL = `${CANONICAL_BASE_URL}/images/prayas-logo.png`;
export const OG_IMAGE_URL = `${CANONICAL_BASE_URL}/images/og-image.jpg`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = "Prayas Pariwaar - 18 Years of Grassroots Community Seva in Vrindavan, UP";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FAQItemData {
  question: string;
  answer: string;
}

/**
 * Sanitizes dynamic titles (from blog posts or projects) for metadata, Open Graph, and Twitter:
 * - Strips any pre-existing brand suffixes (e.g. "| Prayas Pariwaar", "- Prayas Pariwaar (Vrindavan)", "• Prayas Sanstha")
 * - Strips unintended HTML tags
 * - Collapses excess whitespace
 * - Prevents an empty title if the raw title was purely the brand name
 */
export function sanitizeMetadataTitle(rawTitle: string | null | undefined, fallback: string = "Dispatch"): string {
  if (!rawTitle) return fallback;

  // Strip HTML tags if any
  let clean = rawTitle.replace(/<[^>]*>/g, "");

  // Strip brand suffixes: "| Prayas Pariwaar", "- Prayas Pariwaar", "• Prayas Pariwaar (Vrindavan)", "| Prayas Sanstha", etc.
  clean = clean
    .replace(/\s*([|\-–—•:]|by)\s*Prayas\s*(Pariwaar|Sanstha)?(\s*\(Vrindavan\))?.*$/i, "")
    .trim();

  // Collapse excess whitespace
  clean = clean.replace(/\s+/g, " ").trim();

  // If stripping left an empty string, fallback to original trimmed or default fallback
  if (!clean) {
    return rawTitle.trim() || fallback;
  }

  return clean;
}

/**
 * Generates the canonical Schema.org Organization/NGO entity.
 * Uses only 100% verified facts from the existing repository.
 */
export function getOrganizationSchema() {
  return {
    "@type": ["NGO", "Organization"],
    "@id": ORGANIZATION_ID,
    name: "Prayas Pariwaar",
    alternateName: "Prayas Sanstha",
    url: CANONICAL_BASE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": LOGO_ID,
      url: LOGO_URL,
      caption: "Prayas Pariwaar Logo",
    },
    image: LOGO_URL,
    description:
      "18-year-old registered grassroots non-profit society in Vrindavan, Mathura District, UP, dedicated to free child education, 24/7 volunteer emergency blood coordination, medical equipment lending bank, native tree plantation, and healthcare assistance.",
    foundingDate: "2006",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Prayas Seva Karyalaya, Near Raman Reti, Parikrama Marg",
      addressLocality: "Vrindavan",
      addressRegion: "Uttar Pradesh",
      postalCode: "281121",
      addressCountry: "IN",
    },
    telephone: "+91-9927081650",
    email: "av.prayas@gmail.com",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-9927081650",
        contactType: "Emergency Blood Helpline",
        availableLanguage: ["Hindi", "English"],
        areaServed: "IN",
      },
      {
        "@type": "ContactPoint",
        telephone: "+91-9927081650",
        contactType: "Medical Equipment Coordinator",
        availableLanguage: ["Hindi", "English"],
        areaServed: "IN",
      },
      {
        "@type": "ContactPoint",
        email: "av.prayas@gmail.com",
        contactType: "General Enquiries",
        availableLanguage: ["Hindi", "English"],
      },
    ],
    areaServed: [
      {
        "@type": "City",
        name: "Vrindavan",
      },
      {
        "@type": "AdministrativeArea",
        name: "Mathura District",
      },
      {
        "@type": "AdministrativeArea",
        name: "Uttar Pradesh",
      },
    ],
    knowsAbout: [
      "Voluntary Blood Donation",
      "Medical Equipment Lending",
      "Child Education",
      "Native Tree Afforestation",
      "Healthcare Camps",
      "Emergency Relief Seva",
    ],
  };
}

/**
 * Generates the canonical Schema.org WebSite entity.
 * Connected directly to the organization publisher via @id.
 */
export function getWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: CANONICAL_BASE_URL,
    name: "Prayas Pariwaar",
    description:
      "Official portal for Prayas Pariwaar, registered grassroots non-profit society in Vrindavan, UP.",
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    inLanguage: "en-IN",
  };
}

/**
 * Emits the root graph containing Organization and WebSite schemas.
 * Injected in (public)/layout.tsx so that private/admin routes never leak public entities.
 */
export function getRootPublicGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [getOrganizationSchema(), getWebSiteSchema()],
  };
}

/**
 * Generates an accurate, canonical BreadcrumbList schema.
 */
export function getBreadcrumbListSchema(items: BreadcrumbItem[], pageUrl?: string) {
  const fullPageUrl = pageUrl
    ? pageUrl.startsWith("http")
      ? pageUrl
      : `${CANONICAL_BASE_URL}${pageUrl}`
    : undefined;

  return {
    "@type": "BreadcrumbList",
    ...(fullPageUrl ? { "@id": `${fullPageUrl}#breadcrumb` } : {}),
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http")
        ? item.path
        : `${CANONICAL_BASE_URL}${item.path}`,
    })),
  };
}

/**
 * Generates a connected WebPage/ItemPage/CollectionPage/AboutPage schema
 * linked to the WebSite (@isPartOf) and Organization (@about).
 */
export function getWebPageGraph({
  title,
  description,
  path,
  type = "WebPage",
  breadcrumbs,
  mainEntity,
  additionalGraphItems = [],
}: {
  title: string;
  description: string;
  path: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "ItemPage";
  breadcrumbs?: BreadcrumbItem[];
  mainEntity?: Record<string, any>;
  additionalGraphItems?: Record<string, any>[];
}) {
  const fullUrl = path.startsWith("http") ? path : `${CANONICAL_BASE_URL}${path}`;
  const webpageId = `${fullUrl}#webpage`;

  const webPageEntity: Record<string, any> = {
    "@type": type,
    "@id": webpageId,
    url: fullUrl,
    name: title,
    description,
    isPartOf: {
      "@id": WEBSITE_ID,
    },
    about: {
      "@id": ORGANIZATION_ID,
    },
    inLanguage: "en-IN",
  };

  const graphItems: Record<string, any>[] = [webPageEntity];

  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbEntity = getBreadcrumbListSchema(breadcrumbs, fullUrl);
    webPageEntity.breadcrumb = { "@id": breadcrumbEntity["@id"] };
    graphItems.push(breadcrumbEntity);
  }

  if (mainEntity) {
    webPageEntity.mainEntity = mainEntity;
  }

  if (additionalGraphItems.length > 0) {
    graphItems.push(...additionalGraphItems);
  }

  return {
    "@context": "https://schema.org",
    "@graph": graphItems,
  };
}

/**
 * Generates FAQPage schema for verified Q&A content.
 */
export function getFAQPageSchema(faqs: FAQItemData[], pageUrl: string = "/") {
  const fullUrl = pageUrl.startsWith("http") ? pageUrl : `${CANONICAL_BASE_URL}${pageUrl}`;

  return {
    "@type": "FAQPage",
    "@id": `${fullUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
