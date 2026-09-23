# CLAUDE.md

Este archivo complementa a `AGENTS.md`, que es la fuente de verdad sobre arquitectura, stack y convenciones del proyecto. **Léelo primero.**

## Resumen rápido

- Backend: NestJS + TypeORM + MySQL, arquitectura en capas (Controller → Service → Repository → Entity), un módulo por dominio.
- Frontend: plantilla Next.js ya existente en `frontend/`, no reescribir su estructura base.
- Auth: JWT con expiración de 30 minutos.
- Sin pruebas unitarias en esta fase.

## Reglas específicas para trabajar en este repo

1. **No crear un `CRUDRepository` genérico que centralice la lógica de todas las entidades.** Cada modelo (`patients`, `appointments`, `prescriptions`, etc.) tiene su propio `*.service.ts` con sus reglas de negocio y su propio `*.repository.ts` para acceso a datos.
2. **Antes de generar código de un módulo nuevo**, revisa si ya existe un módulo similar en `src/modules/` y sigue el mismo patrón de carpetas (`module`, `controller`, `service`, `repository`, `entities/`, `dto/`).
3. **Los DTOs siempre usan `class-validator`.** No aceptar payloads sin validar.
4. **Los controllers no contienen lógica de negocio.** Si aparece lógica condicional compleja en un controller, muévela al service.
5. **El backend aún no existe.** Al generarlo, respeta exactamente la estructura de carpetas descrita en `AGENTS.md`.
6. **No generar tests** salvo que el usuario lo pida explícitamente en un mensaje posterior.
7. **No usar `ENUM` de MySQL/TypeORM.** Todo valor cerrado de negocio (roles, estados de cita, estados de alerta, tipos de producto) vive en su tabla de catálogo (`roles`, `appointment_statuses`, `alert_statuses`, `product_types`) referenciada por FK.
8. **Toda escritura de negocio queda auditada:** al crear/actualizar una entidad, poblar `created_by_id`/`updated_by_id` (tomados del usuario autenticado en el `request`) y registrar la acción en `audit_logs` (vía un `AuditInterceptor` o `AuditService` compartido). No se implementan altas/bajas silenciosas.
9. Al modificar el modelo de datos, actualiza también `schema.dbml` para mantenerlo sincronizado con las entidades reales de TypeORM.

## Autorización sobre el modelo de datos y la base de datos real

- **Editar `schema.dbml` está siempre autorizado.** Es el artefacto de diseño; puedes modificarlo libremente al evolucionar el modelo, sin pedir permiso adicional.
- **Crear o modificar la base de datos MySQL real** (ejecutar migraciones, `CREATE TABLE`, correr `synchronize`, aplicar un script SQL contra un servidor) **requiere autorización explícita del usuario en el chat** antes de ejecutarse, incluso si `schema.dbml` ya refleja el cambio.
- Cuando esa autorización llegue, genera el script (migración de TypeORM o SQL) **a partir del `schema.dbml` vigente en ese momento**, no de una versión anterior ni de memoria.

## Al generar el backend

Orden sugerido para minimizar retrabajo y dependencias circulares:

1. Bootstrap del proyecto Nest (`nest new backend`, configuración de TypeORM/MySQL, `.env`).
2. Módulo `auth` + `users` (login y JWT de 30 min).
3. Módulo `patients` (incluye `isPriority` / `isDeceased`).
4. Módulos `medical-history`, `chronic-conditions`, `alerts` — están relacionados: una condición crónica activa puede disparar alertas.
5. Módulo `appointments`.
6. Módulos `pharmacy-products` y `prescriptions` (con `prescription-items`).

## Al tocar el frontend

- Verifica primero qué convenciones ya trae la plantilla de Next.js (`frontend/`) antes de imponer una estructura distinta.
- Centraliza las llamadas a la API del backend en una capa de cliente HTTP, no en los componentes directamente.

## Antes de dar por terminado un módulo

- Controller sin lógica de negocio.
- Service con las reglas específicas de esa entidad (no genéricas).
- Repository propio de la entidad (puede extender la base ligera de `common/base`, pero sin lógica de dominio ahí).
- DTOs de entrada validados con `class-validator`.
- Entidad de TypeORM alineada con `schema.dbml`.