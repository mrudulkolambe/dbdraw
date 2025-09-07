import { FieldType, IColumn } from "@/types/schemas/table"

const project = {
	id: "proj_87182377981",
	name: "E-commerce Platform",
	tables: [
		{
			id: "n1",
			name: "users",
			position: {
				x: 0,
				y: 0
			},
			columns: [
				{
					id: "col_87182377980",
					name: "_id",
					type: FieldType.primary,
					primary: true,
					unique: true,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377981",
					name: "user_id",
					type: FieldType.date,
					primary: true,
					unique: true,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377982",
					name: "firstname",
					type: FieldType.string,
					primary: false,
					unique: false,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377983",
					name: "lastname",
					type: FieldType.string,
					primary: false,
					unique: false,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377984",
					name: "email",
					type: FieldType.string,
					primary: false,
					unique: true,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377985",
					name: "role",
					type: FieldType.string,
					primary: false,
					unique: false,
					required: true,
					list: false,
					default: ""
				},
			] as IColumn[]
		},
		{
			id: "n2",
			name: "products",
			position: {
				x: 0,
				y: 0
			},
			columns: [
				{
					id: "col_87182377980",
					name: "_id",
					type: FieldType.primary,
					primary: true,
					unique: true,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377981",
					name: "product_id",
					type: FieldType.string,
					primary: true,
					unique: true,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377981",
					name: "product_sku",
					type: FieldType.string,
					primary: false,
					unique: true,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377982",
					name: "product_name",
					type: FieldType.string,
					primary: false,
					unique: false,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377983",
					name: "product_description",
					type: FieldType.string,
					primary: false,
					unique: false,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377984",
					name: "product_price",
					type: FieldType.number,
					primary: false,
					unique: false,
					required: true,
					list: false,
					default: ""
				},
				{
					id: "col_87182377985",
					name: "product_image",
					type: FieldType.string,
					primary: false,
					unique: false,
					required: true,
					list: true,
					default: ""
				},
				{
					id: "col_87182377986",
					name: "product_user",
					type: FieldType.ref,
					primary: false,
					unique: false,
					required: true,
					list: true,
					default: ""
				},
			] as IColumn[]
		}
	]
}

export default project