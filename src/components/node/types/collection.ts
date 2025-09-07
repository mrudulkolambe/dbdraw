import { IColumn } from "@/types/schemas/table";

export type CollectionNodeData = {
	name: string;
	columns: IColumn[],
	// onClick: (id: string) => void;
	// onRename: (id: string) => void;
	// onDuplicate: (node: CollectionNodeData) => void;
	// onDelete: (id: string) => void;
	onFieldDelete: (collection: string, fieldId: string) => void;
	// addNote: (title: string, description: string, collection?: string) => void;
	// tableWidth: number
};