import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

/** Nombres de rol del backend (`roles.name`). */
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  doctor: "Médico",
  nurse: "Enfermería",
  receptionist: "Recepción",
  pharmacist: "Farmacia",
};

const MODULES = [
  "Pacientes",
  "Citas",
  "Historial médico",
  "Condiciones crónicas",
  "Alertas",
  "Recetas",
  "Farmacia",
];

const DashboardPage = async () => {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Panel</CardTitle>
        </CardHeader>
        <CardContent className="text-default-600 space-y-1">
          <p>
            Bienvenido,{" "}
            <span className="font-medium text-default-900">
              {session?.user?.name ?? "usuario"}
            </span>
            {role ? ` — ${ROLE_LABELS[role] ?? role}` : null}
          </p>
          <p className="text-sm">
            Los módulos del sistema están en construcción. La navegación del menú
            ya está disponible.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Módulos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {MODULES.map((name) => (
            <span
              key={name}
              className="rounded-full bg-default-100 px-3 py-1 text-sm text-default-600"
            >
              {name}
            </span>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
