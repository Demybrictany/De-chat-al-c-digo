import type { Metadata } from "next";
import ModulePlaceholder from "@/components/partials/module-placeholder";

export const metadata: Metadata = { title: "Pacientes" };

const PatientsPage = () => (
  <ModulePlaceholder
    title="Pacientes"
    icon="heroicons-outline:users"
    description="Registro de pacientes, con marcado de prioridad y de fallecimiento."
  />
);

export default PatientsPage;
