import { Icon } from "@/components/ui/icon";

/**
 * Marcador de posición para los módulos que todavía no tienen CRUD.
 *
 * El enunciado pide no integrar los CRUDs en esta fase, pero `lib/menus.ts`
 * ya enlaza a estas rutas: así la navegación no termina en un 404.
 */
const ModulePlaceholder = ({
  title,
  description,
  icon = "heroicons-outline:cube",
}: {
  title: string;
  description: string;
  icon?: string;
}) => {
  return (
    <div className="space-y-5">
      <h4 className="text-2xl font-semibold text-default-900">{title}</h4>
      <div className="rounded-md border border-default-200 bg-card px-6 py-16 flex flex-col items-center text-center gap-3">
        <div className="h-14 w-14 rounded-full bg-default-100 flex items-center justify-center">
          <Icon icon={icon} className="h-7 w-7 text-default-500" />
        </div>
        <p className="text-base font-medium text-default-800">
          Módulo en construcción
        </p>
        <p className="text-sm text-default-500 max-w-md">{description}</p>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
