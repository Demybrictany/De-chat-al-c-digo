import type { Metadata } from "next";
import ModulePlaceholder from "@/components/partials/module-placeholder";

export const metadata: Metadata = { title: "Condiciones crónicas" };

const ChronicConditionsPage = () => (
  <ModulePlaceholder
    title="Condiciones crónicas"
    icon="heroicons-outline:heart"
    description="Condiciones crónicas por paciente. Una condición activa dispara alertas de seguimiento."
  />
);

export default ChronicConditionsPage;
