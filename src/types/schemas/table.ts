export enum FieldType {
	string = "string",
	number = "number",
	boolean = "boolean",
	date = "date",
	ref = "ref",
	primary = "primary"
}

export interface ITable {
	id: string;
	type: "collection";
	data: IData;
	position: IPosition;
	projectID: string;
  }

  export interface IData {
	name: string;
	columns: IColumn[];
  }
  
  export interface IColumn {
	id: string;
	name: string;
	type: FieldType;
	required: boolean;
	unique: boolean;
	default: string;
	list: boolean;
	primary: boolean;
  }

  export interface IPosition {
	x: number;
	y: number;
  }