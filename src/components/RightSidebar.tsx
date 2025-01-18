import { Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { CollectionNodeType, Field } from "./nodes/CollectionNode";
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";

interface RightSidebarProps {
	collection?: CollectionNodeType;
	onUpsertField: (id: string, field: Field) => void;
	setSelectedField: React.Dispatch<React.SetStateAction<string>>;
	selectedField: string;
	onDeleteField: (id: string, fieldName: string) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ collection, onUpsertField, onDeleteField, selectedField, setSelectedField }) => {
	const [fieldId, setFieldId] = useState("");
	const [fieldName, setFieldName] = useState("");
	const [fieldType, setFieldType] = useState("string");
	const [fieldRequired, setFieldRequired] = useState(false);
	const [fieldDefault, setFieldDefault] = useState("");
	const [fieldIsList, setFieldIsList] = useState(false);
	const [fieldUnique, setFieldUnique] = useState(false);
	useEffect(() => {
		if (selectedField && collection) {
			const field = collection.data.fields.find((f) => f.id === selectedField);
			if (field) {
				setFieldId(field.id);
				setFieldName(field.name);
				setFieldType(field.type);
				setFieldRequired(field.required);
				setFieldDefault(field.default);
				setFieldIsList(field.list);
				setFieldUnique(field.unique);
			}
		} else {
			setFieldId("");
			setFieldName("");
			setFieldType("string");
			setFieldRequired(false);
			setFieldDefault("");
			setFieldIsList(false);
			setFieldUnique(false);
		}
	}, [selectedField, collection]);

	const handleField = () => {
		if (collection && fieldName) {
			if (selectedField) {
				onUpsertField(collection.id, {
					id: fieldId,
					name: fieldName,
					type: fieldType,
					required: fieldRequired,
					default: fieldDefault,
					list: fieldIsList,
					unique: fieldUnique,
				});
			} else {
				onUpsertField(collection.id, {
					id: uuidv4(),
					name: fieldName,
					type: fieldType,
					required: fieldRequired,
					default: fieldDefault,
					list: fieldIsList,
					unique: fieldUnique,
				});
			}
			setFieldId("");
			setFieldName("");
			setFieldType("string");
			setFieldRequired(false);
			setFieldDefault("");
			setFieldIsList(false);
			setFieldUnique(false);
			setSelectedField("");
		}
	};

	const handleDeleteField = (fieldId: string) => {
		if (collection) {
			onDeleteField(collection.id, fieldId);
			setSelectedField("");
		}
	};

	return (
		<div className="h-full w-full bg-secondary text-white flex flex-col">
			<h2 className="text-2xl font-bold mb-4 px-4">Field Details</h2>
			{collection ? (
				<>
					<div className="mb-4 px-4">
						<input
							type="text"
							value={fieldName}
							onChange={(e) => setFieldName(e.target.value)}
							placeholder="Field name"
							className="input mb-3"
						/>
						<Select value={fieldType} onValueChange={(e) => setFieldType(e)}>
							<SelectTrigger className="w-full text-white">
								<SelectValue placeholder="String" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="string">String</SelectItem>
								<SelectItem value="number">Number</SelectItem>
								<SelectItem value="date">Date</SelectItem>
								<SelectItem value="ref">Reference</SelectItem>
								<SelectItem value="primary">Primary</SelectItem>
								<SelectItem value="boolean">Boolean</SelectItem>
							</SelectContent>
						</Select>
						<label className="mt-4 flex items-center mb-2 gap-2">
							<Switch checked={fieldRequired} onCheckedChange={(e) => setFieldRequired(e)} />
							Required
						</label>
						<input
							type="text"
							value={fieldDefault}
							onChange={(e) => setFieldDefault(e.target.value)}
							placeholder="Default value"
							className="input mb-3"
						/>
						<label className="flex items-center mb-2 gap-2">
							<Switch checked={fieldIsList} onCheckedChange={(e) => setFieldIsList(e)} />
							List
						</label>
						<label className="flex items-center mb-2 gap-2">
							<Switch checked={fieldUnique} onCheckedChange={(e) => setFieldUnique(e)} />
							Unique
						</label>
						<button onClick={handleField} className="bg-blue-600 button w-full">
							Add/Update Field
						</button>
					</div>
					<div className="flex-1 flex flex-col overflow-auto px-4">
						{collection.data.fields.map((field) => (
							<div
								key={field.name}
								className={`hover:bg-white/5 duration-300 group font-semibold border border-white/5 px-2 py-2 flex justify-between items-center mb-2  rounded-lg ${selectedField === field.id ? "bg-white/5" : ""}`}
								onClick={() => field.type === "primary" ? {} : setSelectedField(field.id)}
							>
								<span className="text-sm text-white gap-2 flex items-center">
									<div className="text-white/60 h-8 w-8 bg-white/5 rounded-lg text-[10px] font-bold flex items-center justify-center">{field.type === "string" ? "Abc" : field.type == "primary" ? "Key" : field.type === "number" ? "123" : field.type === "boolean" ? "True" : field.type === "date" ? "Date" : "Ref "}</div>
									<p>{field.name}</p>
								</span>
								{field.type !== "primary" && <button
									onClick={(e) => {
										e.stopPropagation();
										handleDeleteField(field.id);
									}}
								>
									<div className="duration-300 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto h-7 w-7 font-bold flex items-center justify-center"><Trash2 className="text-white/50" height={18} width={18} /></div>
								</button>}
							</div>
						))}
					</div>
				</>
			) : (
				<h2 className="text-xl font-semibold px-4">No collection selected</h2>
			)}
		</div>
	);
};

export default RightSidebar;
