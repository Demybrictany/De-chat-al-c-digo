import type { Metadata } from "next";
import ModulePlaceholder from "@/components/partials/module-placeholder";

export const metadata: Metadata = { title: "Farmacia" };

const PharmacyProductsPage = () => (
  <ModulePlaceholder
    title="Farmacia"
    icon="heroicons-outline:beaker"
    description="Banco de productos de farmacia y muestras médicas, con sus existencias."
  />
);

export default PharmacyProductsPage;
