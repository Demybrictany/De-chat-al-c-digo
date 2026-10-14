import { MigrationInterface, QueryRunner } from 'typeorm';

/** Cambio derivado de schema.dbml (SHA-256 f1806febf77b0490dd95b2698223e3b8ac1dc9b57b9fe24c45d978891220b506).
 * Conserva filas y relaciones. Los pacientes existentes quedan sin archivar.
 */
export class AddPatientArchive1791849601000 implements MigrationInterface {
  name = 'AddPatientArchive1791849601000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql' ||
        queryRunner.connection.options.database !== 'clinicas') {
      throw new Error('Esta migracion solo puede ejecutarse en MySQL clinicas.');
    }
    const [current] = await queryRunner.query('SELECT DATABASE() AS databaseName');
    if (current?.databaseName !== 'clinicas') throw new Error('La base seleccionada debe ser clinicas.');
    await queryRunner.query(`
      ALTER TABLE \`patients\`
        ADD COLUMN \`is_archived\` tinyint NOT NULL DEFAULT 0,
        ADD COLUMN \`archived_at\` datetime(6) NULL,
        ADD COLUMN \`archived_by_id\` int NULL,
        ADD COLUMN \`archive_reason\` varchar(500) NULL,
        ADD INDEX \`idx_patients_archived_id\` (\`is_archived\`, \`id\`),
        ADD CONSTRAINT \`FK_d867cb7cb239fad8ab3bc1cc79c\` FOREIGN KEY (\`archived_by_id\`)
          REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error('La reversion eliminaria metadatos de archivo. Preparar una migracion explicita autorizada.');
  }
}
