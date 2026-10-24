import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', {id:text('id').primaryKey(),kind:text('kind').notNull(),caseId:text('case_id'),payload:text('payload').notNull(),revision:integer('revision').notNull().default(1),created:text('created').notNull()},t=>[index('idx_records_case_id').on(t.caseId)]);

export const attachments = sqliteTable('attachments', {id:text('id').primaryKey(),recordId:text('record_id').notNull(),filename:text('filename').notNull(),size:integer('size'),mimeType:text('mime_type'),data:text('data').notNull(),uploadedAt:text('uploaded_at').notNull()},t=>[index('idx_attachments_record').on(t.recordId)]);

export const templates = sqliteTable('templates', {id:text('id').primaryKey(),name:text('name').notNull(),module:text('module').notNull(),method:text('method').notNull(),fields:text('fields').notNull(),description:text('description'),isDefault:integer('is_default').default(0),createdAt:text('created_at').notNull()});
