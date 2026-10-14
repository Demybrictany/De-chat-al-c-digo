import type { Metadata } from "next";
import ModulePlaceholder from "@/components/partials/module-placeholder";

export const metadata: Metadata = { title: "Historial médico" };

const MedicalHistoryPage = () => (
  <ModulePlaceholder
    title="Historial médico"
    icon="heroicons-outline:clipboard-list"
    description="Historial médico de cada paciente: consultas, diagnósticos y notas."
  />
);

export default MedicalHistoryPage;
