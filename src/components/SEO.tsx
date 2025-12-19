import { Helmet } from "react-helmet-async";
import { companyConfig } from "@/config/company.config";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
}

export function SEO({
  title,
  description,
  keywords,
  image = "/og-image.png",
  url,
  type = "website",
  noindex = false,
}: SEOProps) {
  const defaultTitle = `${companyConfig.name} - ${companyConfig.tagline}`;
  const defaultDescription = companyConfig.description;
  const defaultKeywords = "équipement professionnel, paiement échelonné, crédit équipement, financement entreprise, Sénégal, Dakar";

  const pageTitle = title ? `${title} | ${companyConfig.name}` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageUrl = url || window.location.href;
  const pageImage = image.startsWith("http") ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content={companyConfig.name} />
      <link rel="canonical" href={pageUrl} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content={companyConfig.name} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Additional SEO */}
      <meta name="language" content="French" />
      <meta name="geo.region" content="SN" />
      <meta name="geo.placename" content="Dakar" />

      {/* Business Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": companyConfig.name,
          "legalName": companyConfig.legalName,
          "description": companyConfig.description,
          "email": companyConfig.email,
          "telephone": companyConfig.phone,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": companyConfig.address.street,
            "addressLocality": companyConfig.address.city,
            "addressCountry": companyConfig.address.country,
          },
          "url": pageUrl,
          "image": pageImage,
          "priceRange": "$$",
          "currencyAccepted": "XOF",
          "paymentAccepted": "Credit installments",
        })}
      </script>
    </Helmet>
  );
}
