export class Dbs {
	id: number;
	name: string;
	type: string;
	active: boolean;
	connection: string;
	login: string;
	password: string;
	db: string;
	table_aliases: string[][];
	field_aliases: string[][];
	properties: string[][];
}
