// Company configuration - Business identity and contact info
// This defines the current company operating the platform

export interface CompanyConfig {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
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
  description: "Votre partenaire pour l'achat d'équipements professionnels avec paiement échelonné adapté à vos besoins.",
  email: "contact@sen-services.com",
  phone: "+221 33 864 48 48",
  address: {
    street: "En face Auto Pont BRT Liberté 5 Villa N°5492",
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
