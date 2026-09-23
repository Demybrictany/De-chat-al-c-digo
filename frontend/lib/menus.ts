export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};
export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

// Menu de la clinica. Solo secciones utiles del dominio; labels en espanol.
// Los CRUD aun no existen: estos href apuntan a rutas que se crearan despues.
// `t` se mantiene en la firma por compatibilidad con los componentes de sidebar, pero no se usa.
function clinicMenu(pathname: string): Group[] {
  const item = (
    id: string,
    href: string,
    label: string,
    icon: string,
  ): Menu => ({
    id,
    href,
    label,
    active: pathname.includes(href),
    icon,
    submenus: [],
  });

  return [
    {
      groupLabel: "Principal",
      id: "principal",
      menus: [item("dashboard", "/dashboard/analytics", "Dashboard", "heroicons-outline:home")],
    },
    {
      groupLabel: "Gestión clínica",
      id: "clinica",
      menus: [
        item("patients", "/patients", "Pacientes", "heroicons-outline:users"),
        item("appointments", "/appointments", "Citas", "heroicons-outline:calendar"),
        item("medical-history", "/medical-history", "Historial médico", "heroicons-outline:clipboard-list"),
        item("chronic-conditions", "/chronic-conditions", "Condiciones crónicas", "heroicons-outline:heart"),
        item("alerts", "/alerts", "Alertas", "heroicons-outline:bell"),
        item("prescriptions", "/prescriptions", "Recetas", "heroicons-outline:document-text"),
        item("pharmacy-products", "/pharmacy-products", "Farmacia", "heroicons-outline:beaker"),
      ],
    },
    {
      groupLabel: "Administración",
      id: "administracion",
      menus: [item("users", "/users", "Usuarios", "heroicons-outline:user-circle")],
    },
  ];
}

export function getMenuList(pathname: string, _t?: any): Group[] {
  return clinicMenu(pathname);
}

export function getHorizontalMenuList(pathname: string, _t?: any): Group[] {
  return clinicMenu(pathname);
}
