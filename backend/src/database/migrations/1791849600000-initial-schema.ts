import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Generada sin conexion a MySQL a partir del schema.dbml vigente.
 * SHA-256 del DBML al generar: 42485d49d64d69c3cd261344bb7c26ab25ab831baa2639f02290f04812f3c5c3
 * 14 tablas, 131 columnas, 36 FK, 17 indices y 6 indices unicos.
 * No contiene seeds ni modifica tablas existentes.
 * MySQL DDL hace commit implicito: no asumir rollback transaccional.
 */
export class InitialSchema1791849600000 implements MigrationInterface {
  name = 'InitialSchema1791849600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'mysql' ||
        queryRunner.connection.options.database !== 'clinicas') {
      throw new Error('La migracion inicial solo puede ejecutarse en MySQL clinicas.');
    }
    const [current] = await queryRunner.query('SELECT DATABASE() AS databaseName');
    if (current?.databaseName !== 'clinicas') {
      throw new Error('La conexion actual no selecciona la base clinicas.');
    }
    const tables = [
      "roles",
      "appointment_statuses",
      "alert_statuses",
      "product_types",
      "users",
      "patients",
      "medical_histories",
      "chronic_conditions",
      "alerts",
      "appointments",
      "pharmacy_products",
      "prescriptions",
      "prescription_items",
      "audit_logs"
    ];
    const placeholders = tables.map(() => '?').join(', ');
    const existing = await queryRunner.query(
      'SELECT TABLE_NAME AS tableName FROM information_schema.TABLES ' +
      'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (' + placeholders + ')',
      tables,
    );
    if (existing.length > 0) {
      throw new Error('No se sobrescriben tablas existentes: ' +
        existing.map((row: { tableName: string }) => row.tableName).join(', '));
    }

    await queryRunner.query(`
CREATE TABLE \`roles\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(50) NOT NULL,
  \`description\` VARCHAR(255) NULL,
  \`status\` INT NOT NULL DEFAULT 1,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`appointment_statuses\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(50) NOT NULL,
  \`description\` VARCHAR(255) NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`IDX_dc14712927b80d8e607315e25b\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`alert_statuses\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(50) NOT NULL,
  \`description\` VARCHAR(255) NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`IDX_6f385a1c721e26739bceb576b6\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`product_types\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(50) NOT NULL,
  \`description\` VARCHAR(255) NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`IDX_2b3bfea1c7797e9d067dfc3c7a\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`users\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`role_id\` INT NOT NULL,
  \`full_name\` VARCHAR(150) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`is_active\` BOOLEAN NOT NULL DEFAULT 1,
  \`created_by_id\` INT NULL,
  \`updated_by_id\` INT NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
  INDEX \`idx_users_role\` (\`role_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`patients\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`first_name\` VARCHAR(100) NOT NULL,
  \`last_name\` VARCHAR(100) NOT NULL,
  \`birth_date\` DATE NOT NULL,
  \`gender\` VARCHAR(20) NULL,
  \`national_id\` VARCHAR(30) NULL,
  \`phone\` VARCHAR(30) NULL,
  \`address\` VARCHAR(255) NULL,
  \`is_priority\` BOOLEAN NOT NULL DEFAULT 0,
  \`is_deceased\` BOOLEAN NOT NULL DEFAULT 0,
  \`deceased_at\` DATETIME NULL,
  \`created_by_id\` INT NOT NULL,
  \`updated_by_id\` INT NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  UNIQUE INDEX \`IDX_b0abe36f7e57f4cd6b965c8c67\` (\`national_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`medical_histories\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`patient_id\` INT NOT NULL,
  \`doctor_id\` INT NOT NULL,
  \`visit_date\` DATETIME NOT NULL,
  \`diagnosis\` TEXT NULL,
  \`notes\` TEXT NULL,
  \`created_by_id\` INT NOT NULL,
  \`updated_by_id\` INT NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  INDEX \`idx_histories_patient_visit\` (\`patient_id\`, \`visit_date\`),
  INDEX \`idx_histories_doctor_visit\` (\`doctor_id\`, \`visit_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`chronic_conditions\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`patient_id\` INT NOT NULL,
  \`condition_name\` VARCHAR(150) NOT NULL,
  \`diagnosed_at\` DATE NULL,
  \`severity\` VARCHAR(30) NULL,
  \`is_active\` BOOLEAN NOT NULL DEFAULT 1,
  \`created_by_id\` INT NOT NULL,
  \`updated_by_id\` INT NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  INDEX \`idx_conditions_patient_active\` (\`patient_id\`, \`is_active\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`alerts\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`patient_id\` INT NOT NULL,
  \`chronic_condition_id\` INT NULL,
  \`status_id\` INT NOT NULL,
  \`alert_type\` VARCHAR(50) NOT NULL,
  \`message\` TEXT NOT NULL,
  \`triggered_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`resolved_at\` DATETIME NULL,
  \`resolved_by_id\` INT NULL,
  \`created_by_id\` INT NOT NULL,
  \`updated_by_id\` INT NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  INDEX \`idx_alerts_patient_triggered\` (\`patient_id\`, \`triggered_at\`),
  INDEX \`idx_alerts_status_triggered\` (\`status_id\`, \`triggered_at\`),
  INDEX \`idx_alerts_condition\` (\`chronic_condition_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`appointments\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`patient_id\` INT NOT NULL,
  \`doctor_id\` INT NOT NULL,
  \`status_id\` INT NOT NULL,
  \`scheduled_at\` DATETIME NOT NULL,
  \`reason\` VARCHAR(255) NULL,
  \`notes\` TEXT NULL,
  \`created_by_id\` INT NOT NULL,
  \`updated_by_id\` INT NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  INDEX \`idx_appointments_patient_schedule\` (\`patient_id\`, \`scheduled_at\`),
  INDEX \`idx_appointments_doctor_schedule\` (\`doctor_id\`, \`scheduled_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`pharmacy_products\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`type_id\` INT NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`manufacturer\` VARCHAR(150) NULL,
  \`stock_quantity\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`unit\` VARCHAR(30) NULL,
  \`expiration_date\` DATE NULL,
  \`created_by_id\` INT NOT NULL,
  \`updated_by_id\` INT NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  INDEX \`idx_products_type\` (\`type_id\`),
  INDEX \`idx_products_expiration\` (\`expiration_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`prescriptions\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`patient_id\` INT NOT NULL,
  \`doctor_id\` INT NOT NULL,
  \`medical_history_id\` INT NULL,
  \`issued_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`notes\` TEXT NULL,
  \`created_by_id\` INT NOT NULL,
  \`updated_by_id\` INT NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  INDEX \`idx_prescriptions_patient_issued\` (\`patient_id\`, \`issued_at\`),
  INDEX \`idx_prescriptions_history\` (\`medical_history_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`prescription_items\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`prescription_id\` INT NOT NULL,
  \`pharmacy_product_id\` INT NOT NULL,
  \`dosage\` VARCHAR(100) NULL,
  \`frequency\` VARCHAR(100) NULL,
  \`duration\` VARCHAR(100) NULL,
  \`quantity\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`created_by_id\` INT NOT NULL,
  \`updated_by_id\` INT NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  \`updated_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  INDEX \`idx_items_prescription\` (\`prescription_id\`),
  INDEX \`idx_items_product\` (\`pharmacy_product_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
CREATE TABLE \`audit_logs\` (
  \`id\` INT NOT NULL AUTO_INCREMENT,
  \`user_id\` INT NULL,
  \`action\` VARCHAR(20) NOT NULL,
  \`entity_name\` VARCHAR(100) NOT NULL,
  \`entity_id\` INT NULL,
  \`old_values\` JSON NULL,
  \`new_values\` JSON NULL,
  \`ip_address\` VARCHAR(45) NULL,
  \`created_at\` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (\`id\`),
  INDEX \`idx_audit_entity_created\` (\`entity_name\`, \`entity_id\`, \`created_at\`),
  INDEX \`idx_audit_user_created\` (\`user_id\`, \`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a2cecd1a3531c0b041e29ba46e1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`users\` ADD CONSTRAINT \`FK_1bbd34899b8e74ef2a7f3212806\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`users\` ADD CONSTRAINT \`FK_80e310e761f458f272c20ea6add\` FOREIGN KEY (\`updated_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`patients\` ADD CONSTRAINT \`FK_b48dc58a26594f4674191275477\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`patients\` ADD CONSTRAINT \`FK_891edb3ee767850e61c2649f5a2\` FOREIGN KEY (\`updated_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`medical_histories\` ADD CONSTRAINT \`FK_346f79a689d013533a8b6f1c7dd\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`medical_histories\` ADD CONSTRAINT \`FK_499c19b31792aaab9186e8b0768\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`medical_histories\` ADD CONSTRAINT \`FK_c2fc256ddfeac4cda0058c21138\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`medical_histories\` ADD CONSTRAINT \`FK_78a35c5fc59e25b85e5c659ee25\` FOREIGN KEY (\`updated_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`chronic_conditions\` ADD CONSTRAINT \`FK_d391dc30fb4d24d362b80b2b165\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`chronic_conditions\` ADD CONSTRAINT \`FK_0913b07239fef34021c3bd200ba\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`chronic_conditions\` ADD CONSTRAINT \`FK_73f4d7078a283b7f65653c30314\` FOREIGN KEY (\`updated_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`alerts\` ADD CONSTRAINT \`FK_44bfa58a58a849cf7356b99b83c\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`alerts\` ADD CONSTRAINT \`FK_957277ca1e1a91280c61d347620\` FOREIGN KEY (\`chronic_condition_id\`) REFERENCES \`chronic_conditions\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`alerts\` ADD CONSTRAINT \`FK_ba8a42550c62ac4e6f136a3032e\` FOREIGN KEY (\`status_id\`) REFERENCES \`alert_statuses\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`alerts\` ADD CONSTRAINT \`FK_f24ed04d19fdae8c55b4f6f2324\` FOREIGN KEY (\`resolved_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`alerts\` ADD CONSTRAINT \`FK_15021a121cf8e503e938b25fa95\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`alerts\` ADD CONSTRAINT \`FK_092be05ed10d7ebe5f3b2e08f16\` FOREIGN KEY (\`updated_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_3330f054416745deaa2cc130700\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_4cf26c3f972d014df5c68d503d2\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_2b35dd864ffc9740d944427f790\` FOREIGN KEY (\`status_id\`) REFERENCES \`appointment_statuses\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_576dbd04e25eec97a19ff68841f\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_e9cfb799161382cda7e6d60f70f\` FOREIGN KEY (\`updated_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`pharmacy_products\` ADD CONSTRAINT \`FK_1b1c751b192c18fd60c1fcec208\` FOREIGN KEY (\`type_id\`) REFERENCES \`product_types\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`pharmacy_products\` ADD CONSTRAINT \`FK_be64e55a010640b4d937ea15760\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`pharmacy_products\` ADD CONSTRAINT \`FK_1fc9ecb0e96f442b81b71491056\` FOREIGN KEY (\`updated_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`prescriptions\` ADD CONSTRAINT \`FK_9389db557647131856661f7d7b5\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`prescriptions\` ADD CONSTRAINT \`FK_2d6a1941bd705056030c2b9e07d\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`prescriptions\` ADD CONSTRAINT \`FK_76d83c8ccc9eec69f9235811444\` FOREIGN KEY (\`medical_history_id\`) REFERENCES \`medical_histories\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`prescriptions\` ADD CONSTRAINT \`FK_3889a6706b0b302803f8e5aa4ca\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`prescriptions\` ADD CONSTRAINT \`FK_19840f74f339d149be9db51357d\` FOREIGN KEY (\`updated_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`prescription_items\` ADD CONSTRAINT \`FK_a603d92d4a8459db5fbe45a4aea\` FOREIGN KEY (\`prescription_id\`) REFERENCES \`prescriptions\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`prescription_items\` ADD CONSTRAINT \`FK_02577031aa2fb3294a149772375\` FOREIGN KEY (\`pharmacy_product_id\`) REFERENCES \`pharmacy_products\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`prescription_items\` ADD CONSTRAINT \`FK_67ff78825433e46f60650a99110\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`prescription_items\` ADD CONSTRAINT \`FK_4b884b97100be3d8e969e3ccbee\` FOREIGN KEY (\`updated_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);

    await queryRunner.query(`
ALTER TABLE \`audit_logs\` ADD CONSTRAINT \`FK_bd2726fd31b35443f2245b93ba0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT
    `);
  }

  async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error('Reversion automatica deshabilitada: eliminar estas tablas puede perder datos. Preparar una migracion explicita autorizada.');
  }
}
