import { wrapPowerSyncWithKysely } from "@powersync/kysely-driver";
import { PowerSyncDatabase } from "@powersync/web";
import { column, Schema, Table } from "@powersync/web";

const post = new Table({
	title: column.text,
	content: column.text,
});

const post_data = new Table({
	post_id: column.text,
	key: column.text,
	value: column.text,
	data_type: column.text,
});

export const AppSchema = new Schema({
	post,
	post_data,
});

export type Database = (typeof AppSchema)["types"];

export const powerSyncDb = new PowerSyncDatabase({
	database: {
		dbFilename: "test.sqlite",
	},
	schema: AppSchema,
});

export const db = wrapPowerSyncWithKysely<Database>(powerSyncDb);
