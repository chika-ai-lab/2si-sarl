// Company configuration - Business identity and contact info
// This defines the current company operating the platform

export interface CompanyPhone {
  /** Numéro tel qu'on l'affiche, espaces compris. */
  display: string;
  /** Indicatif inclus, sans espaces — base des liens tel: et wa.me. */
  e164: string;
  whatsapp?: boolean;
}

export interface CompanyConfig {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  email: string;
  /** Ligne d'affichage groupée, conservée pour le SEO et les PDF. */
  phone: string;
  phones: CompanyPhone[];
  website?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  socialLinks: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  legalInfo: {
    registrationNumber: string;
    vatNumber?: string;
    capital?: string;
  };
}

export const companyConfig: CompanyConfig = {
  name: "Sen Services International",
  legalName: "2SI.Sarl",
  tagline: "Équipement à Moindre Coût",
  description: "Équipez votre foyer ou votre entreprise et payez en plusieurs mensualités : une solution de financement pensée pour les salariés, les fonctionnaires et les professionnels du Sénégal.",
  email: "contact@sen-services.com",
  phones: [
    { display: "33 864 48 48", e164: "+221338644848" },
    { display: "77 225 83 83", e164: "+221772258383", whatsapp: true },
    { display: "76 224 65 22", e164: "+221762246522", whatsapp: true },
    { display: "76 600 03 74", e164: "+221766000374" },
  ],
  phone: "33 864 48 48 · 77 225 83 83 · 76 224 65 22 · 76 600 03 74",
  website: "https://www.sen-services.com",
  address: {
    street: "Liberté 5 E, face autopont BRT, Rond-Point 6",
    city: "Dakar",
    postalCode: "",
    country: "Sénégal",
  },
  socialLinks: {
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
  },
  legalInfo: {
    registrationNumber: "NINEA 007835162",
    vatNumber: "",
    capital: "",
  },
};

/** Ligne principale : cible de tous les liens d'appel du site. */
export const primaryPhone = companyConfig.phones[0];

/** Numéros joignables sur WhatsApp, dans l'ordre déclaré. */
export const whatsappPhones = companyConfig.phones.filter((p) => p.whatsapp);

export function telHref(phone: CompanyPhone): string {
  return `tel:${phone.e164}`;
}

/** wa.me attend le numéro international sans « + » ni séparateur. */
export function whatsappHref(phone: CompanyPhone, message?: string): string {
  const base = `https://wa.me/${phone.e164.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
