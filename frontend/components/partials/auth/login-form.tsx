"use client";
import React from 'react'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { cn } from "@/lib/utils"
import { Loader2 } from 'lucide-react';
import { loginUser } from '@/action/auth-action';
import { toast } from "sonner"
import { useParams } from 'next/navigation';

const schema = z.object({
  email: z.string().email({ message: "Ingrese un correo válido." }),
  password: z.string().min(1, { message: "Ingrese su contraseña." }),
});

const LoginForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "es";
  const [passwordType, setPasswordType] = React.useState("password");

  const togglePasswordType = () => {
    setPasswordType((prev) => (prev === "text" ? "password" : "text"));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "all",
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    startTransition(async () => {
      try {
        const result = await loginUser(data);

        if (!result.ok) {
          toast.error(
            result.code === 'backend_unreachable'
              ? "No se pudo contactar el servidor. Intente más tarde."
              : "Correo o contraseña incorrectos",
          );
          return;
        }

        toast.success("Sesión iniciada");
        // Navegación completa a propósito: así el layout protegido (que es un
        // Server Component) vuelve a leer la cookie de sesión recién emitida.
        window.location.assign(`/${locale}/dashboard/analytics`);
      } catch (err: any) {
        toast.error(err?.message ?? "No se pudo iniciar sesión");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className=" font-medium text-default-600">
          Correo electrónico
        </Label>
        <Input size="lg"
          disabled={isPending}
          {...register("email")}
          type="email"
          id="email"
          autoComplete="username"
          className={cn("", {
            "border-destructive ": errors.email,
          })}
        />
      </div>
      {errors.email && (
        <div className=" text-destructive mt-2 text-sm">
          {errors.email.message}
        </div>
      )}

      <div className="mt-3.5 space-y-2">
        <Label htmlFor="password" className="mb-2 font-medium text-default-600">
          Contraseña
        </Label>
        <div className="relative">
          <Input size="lg"
            disabled={isPending}
            {...register("password")}
            type={passwordType}
            id="password"
            autoComplete="current-password"
            className="peer"
            placeholder=" "
          />

          <div
            className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
            onClick={togglePasswordType}
            role="button"
            aria-label={
              passwordType === "password" ? "Mostrar contraseña" : "Ocultar contraseña"
            }
          >
            {passwordType === "password" ? (
              <Icon icon="heroicons:eye" className="w-5 h-5 text-default-400" />
            ) : (
              <Icon
                icon="heroicons:eye-slash"
                className="w-5 h-5 text-default-400"
              />
            )}
          </div>
        </div>
      </div>
      {errors.password && (
        <div className=" text-destructive mt-2 text-sm">
          {errors.password.message}
        </div>
      )}

      <Button fullWidth disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Ingresando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
};
export default LoginForm;
