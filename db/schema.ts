import { integer, pgTable, varchar, text, jsonb, index } from 'drizzle-orm/pg-core';

export const agentsTable = pgTable(
  'agents',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    description: text().notNull(),
    prompt: text().notNull(),
    tools: jsonb(),
    author: varchar({ length: 255 }).notNull().default('Subnet Admin'),
    fork_ref: integer(),
  },
  (table) => ({
    forkRefIdx: index('fork_ref_idx').on(table.fork_ref),
  }),
);
