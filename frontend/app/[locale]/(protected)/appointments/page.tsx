import type { Metadata } from "next";
import ModulePlaceholder from "@/components/partials/module-placeholder";

export const metadata: Metadata = { title: "Citas" };

const AppointmentsPage = () => (
  <ModulePlaceholder
    title="Citas"
    icon="heroicons-outline:calendar"
    description="Registro y seguimiento de citas médicas por paciente y por médico."
  />
);

export default AppointmentsPage;
