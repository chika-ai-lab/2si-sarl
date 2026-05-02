import { Navigate } from "react-router-dom";

// Catégories ont été fusionnées dans la page Catalogue
export function CategoriesPage() {
  return <Navigate to="/admin/commercial/catalogue" replace />;
}

export default CategoriesPage;
