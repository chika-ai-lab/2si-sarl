// Branding configuration - Company-specific visual identity
// Change this file to rebrand for any company

export interface BrandingConfig {
  logo: string;
  logoAlt: string;
  favicon: string;
  primaryColor: string;
  primaryForeground: string;
  secondaryColor: string;
  secondaryForeground: string;
  accentColor: string;
  accentForeground: string;
  fontFamily: string;
  fontHeading: string;
  borderRadius: string;
}

export const brandingConfig: BrandingConfig = {
  logo: "/logo.svg",
  logoAlt: "Company Logo",
  favicon: "/favicon.ico",
  primaryColor: "215 50% 23%",
  primaryForeground: "210 40% 98%",
  secondaryColor: "220 14% 96%",
  secondaryForeground: "215 50% 23%",
  accentColor: "38 92% 50%",
  accentForeground: "0 0% 100%",
  fontFamily: "'Inter', sans-serif",
  fontHeading: "'Inter', sans-serif",
  borderRadius: "0.75rem",
};
