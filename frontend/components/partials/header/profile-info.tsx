import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon"
import { signOut, auth } from "@/lib/auth";
import Image from "next/image";

const AVATAR_FALLBACK = "/images/avatar/av-1.svg";

/** Nombres de rol del backend (`roles.name`) traducidos para mostrar. */
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  doctor: "Médico",
  nurse: "Enfermería",
  receptionist: "Recepción",
  pharmacist: "Farmacia",
};

const ProfileInfo = async () => {
  const session = await auth();
  const role = session?.user?.role;

  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className=" cursor-pointer">
          <div className=" flex items-center gap-3  text-default-800 ">
            <Image
              src={session?.user?.image || AVATAR_FALLBACK}
              alt=""
              width={36}
              height={36}
              className="rounded-full"
            />
            <div className="text-sm font-medium capitalize lg:block hidden  ">
              {session?.user?.name}
            </div>
            <span className="text-base  me-2.5 lg:inline-block hidden">
              <Icon icon="heroicons-outline:chevron-down"></Icon>
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
            <Image
              src={session?.user?.image || AVATAR_FALLBACK}
              alt=""
              width={36}
              height={36}
              className="rounded-full"
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-default-800 capitalize truncate">
                {session?.user?.name}
              </div>
              <div className="text-xs text-default-600 truncate">
                {session?.user?.email}
              </div>
              {role && (
                <div className="text-xs text-default-500">
                  {ROLE_LABELS[role] ?? role}
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm font-medium text-default-600 my-1 px-3 cursor-pointer"
          >
            <form
              className="w-full"
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className=" w-full  flex  items-center gap-2" >
                <Icon icon="heroicons:power" className="w-4 h-4" />
                Cerrar sesión
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
export default ProfileInfo;
