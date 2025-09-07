import { FieldType } from "@/types/schemas/table";

export const getfieldTypeIcon = (type: FieldType) => {
	switch (type) {
		case FieldType.string:
			return "Abc";
		case FieldType.number:
			return "123";
		case FieldType.date:
			return "Date";
		case FieldType.ref:
			return "Ref";
		case FieldType.primary:
			return "KEY";
		case FieldType.boolean:
			return "True";
		default:
			return "text";
	}
};