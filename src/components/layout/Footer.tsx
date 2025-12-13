import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useCompany } from "@/providers/ConfigProvider";
import { useTranslation } from "@/providers/I18nProvider";

export function Footer() {
  const company = useCompany();
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  {company.name.charAt(0)}
                </span>
              </div>
              <span className="font-semibold text-lg">{company.name}</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              {company.description}
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("footer.contact")}</h3>
            <div className="space-y-3 text-sm">
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>{company.email}</span>
              </a>
              <a
                href={`tel:${company.phone}`}
                className="flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{company.phone}</span>
              </a>
              <div className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  {company.address.street}<br />
                  {company.address.postalCode} {company.address.city}<br />
                  {company.address.country}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Navigation</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link
                to="/"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/catalog"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {t("nav.catalog")}
              </Link>
              <Link
                to="/cart"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {t("nav.cart")}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informations</h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link
                to="/legal"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {t("footer.legal")}
              </Link>
              <Link
                to="/privacy"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                to="/terms"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                {t("footer.terms")}
              </Link>
            </nav>
            <p className="text-xs text-primary-foreground/60 pt-2">
              {company.legalInfo.registrationNumber}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>
              © {currentYear} {company.legalName}. {t("footer.rights")}.
            </p>
            <p className="text-xs">
              {company.tagline}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
