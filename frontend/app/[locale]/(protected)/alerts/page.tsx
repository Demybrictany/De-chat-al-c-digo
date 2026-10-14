import type { Metadata } from "next";
import ModulePlaceholder from "@/components/partials/module-placeholder";

export const metadata: Metadata = { title: "Alertas" };

const AlertsPage = () => (
  <ModulePlaceholder
    title="Alertas"
    icon="heroicons-outline:bell"
    description="Alertas activas y resueltas para pacientes con condiciones crónicas."
  />
);

export default AlertsPage;
