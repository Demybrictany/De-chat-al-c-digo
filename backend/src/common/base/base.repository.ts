import { DeepPartial, FindManyOptions, FindOneOptions, ObjectLiteral, Repository } from 'typeorm';

/**
 * Base ligera con operaciones genericas simples (findById, save, remove).
 * NO contiene logica de negocio: cada entidad tiene su propio repositorio de dominio
 * que extiende de esta. Regla del proyecto: nada de CRUD generico centralizado.
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  protected constructor(protected readonly repo: Repository<T>) {}

  findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repo.find(options);
  }

  findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repo.findOne(options);
  }

  findById(id: number, options?: Omit<FindOneOptions<T>, 'where'>): Promise<T | null> {
    return this.repo.findOne({ ...(options ?? {}), where: { id } as any });
  }

  create(data: DeepPartial<T>): T {
    return this.repo.create(data);
  }

  save(entity: DeepPartial<T>): Promise<T> {
    return this.repo.save(entity as any);
  }

  remove(entity: T): Promise<T> {
    return this.repo.remove(entity);
  }
}
