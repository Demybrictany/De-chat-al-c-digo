import type { Metadata } from "next";
import ModulePlaceholder from "@/components/partials/module-placeholder";

export const metadata: Metadata = { title: "Usuarios" };

const UsersPage = () => (
  <ModulePlaceholder
    title="Usuarios"
    icon="heroicons-outline:user-circle"
    description="Usuarios del sistema y sus roles: administrador, médico, enfermería, recepción y farmacia."
  />
);

export default UsersPage;
