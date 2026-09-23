import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Roles del catalogo: admin, doctor, nurse, receptionist, pharmacist */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
