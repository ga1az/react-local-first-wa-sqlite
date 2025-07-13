import { wrapPowerSyncWithKysely } from "@powersync/kysely-driver";
import { PowerSyncDatabase } from "@powersync/web";
import { Schema, Table, column } from "@powersync/web";

const post = new Table(
	{
		title: column.text,
		content: column.text,
	},
	{
		// Only store in local database dont sync queues
		localOnly: true,
	},
);

const post_data = new Table(
	{
		post_id: column.text,
		key: column.text,
		value: column.text,
		data_type: column.text,
	},
	{
		// Only store in local database dont sync queues
		localOnly: true,
	},
);

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
