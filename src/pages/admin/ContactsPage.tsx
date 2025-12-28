import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export function ContactsPage() {
  return (
    <PlaceholderPage
      title="Contacts"
      description="Gestion des contacts et points de contact clients"
      icon="UserCircle"
      suggestedFeatures={[
        "Liste complète des contacts",
        "Historique des interactions",
        "Segmentation des contacts",
        "Fusion de contacts dupliqués",
        "Import/Export de contacts",
        "Notes et rappels"
      ]}
      backLink="/admin/crm/customers"
      backLabel="Retour aux clients"
    />
  );
}

export default ContactsPage;
