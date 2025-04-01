import { Kysely, Migration, MigrationProvider } from 'kysely'

const migrations: Record<string, Migration> = {}

export const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return migrations
  },
}

// Initial migration creating tables
migrations['001'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('post')
      .addColumn('uri', 'varchar', (col) => col.primaryKey())
      .addColumn('cid', 'varchar', (col) => col.notNull())
      .addColumn('indexedAt', 'varchar', (col) => col.notNull())
      .addColumn('text', 'varchar', (col) => col.notNull())
      .execute()

    await db.schema
      .createTable('sub_state')
      .addColumn('service', 'varchar', (col) => col.primaryKey())
      .addColumn('cursor', 'integer', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('post').execute()
    await db.schema.dropTable('sub_state').execute()
  },
}

// Migration to add `isStoic` column
migrations['002'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .alterTable('post')
      .addColumn('isStoic', 'integer', (col) => col.notNull().defaultTo(0)) // 🔹 Change to integer
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema
      .alterTable('post')
      .dropColumn('isStoic')
      .execute()
  },
}
