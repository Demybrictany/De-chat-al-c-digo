import type { Metadata } from "next";
import ModulePlaceholder from "@/components/partials/module-placeholder";

export const metadata: Metadata = { title: "Recetas" };

const PrescriptionsPage = () => (
  <ModulePlaceholder
    title="Recetas"
    icon="heroicons-outline:document-text"
    description="Recetas médicas y su detalle de medicamentos por paciente."
  />
);

export default PrescriptionsPage;
