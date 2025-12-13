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
  name: "ProgressPay",
  legalName: "ProgressPay SARL",
  tagline: "Équipez-vous aujourd'hui, payez progressivement",
  description: "Votre partenaire pour l'achat d'équipements professionnels avec paiement échelonné adapté à vos besoins.",
  email: "contact@progresspay.com",
  phone: "+33 1 23 45 67 89",
  address: {
    street: "123 Avenue des Affaires",
    city: "Paris",
    postalCode: "75001",
    country: "France",
  },
  socialLinks: {
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
  },
  legalInfo: {
    registrationNumber: "RCS Paris 123 456 789",
    vatNumber: "FR12345678901",
    capital: "100 000 €",
  },
};
