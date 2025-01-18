import { Trash, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { CollectionNodeType } from "./nodes/CollectionNode";
import { v4 as uuidv4 } from 'uuid';

interface LeftSidebarProps {
	collections: CollectionNodeType[];
	selectedCollection: string | null;
	setSelectedCollection: React.Dispatch<React.SetStateAction<string>>;
	onAddCollection: (name: string, fields: any) => void;
	onDeleteCollection: (id: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ collections, selectedCollection, setSelectedCollection, onAddCollection, onDeleteCollection }) => {
	const [newCollectionName, setNewCollectionName] = useState("");

	const handleAddCollection = () => {
		if (newCollectionName.trim()) {
			onAddCollection(newCollectionName, [{ name: "_id", type: "primary", required: true, unique: true, list: false, default: "", id: uuidv4() }]);
			setNewCollectionName("");
		}
	};

	return (
		<div className="flex flex-col h-full w-full bg-secondary text-white">
			<h2 className="text-2xl font-bold px-4 mb-4">Collections</h2>
			<div className="px-4 flex flex-col">
				<input
					type="text"
					value={newCollectionName}
					onChange={(e) => setNewCollectionName(e.target.value)}
					placeholder="New collection name"
					className="input mb-3"
				/>
				<button onClick={handleAddCollection} className="bg-blue-600 button w-full mb-4">
					Add Collection
				</button>
			</div>
			<ul className="flex flex-col flex-1 overflow-auto px-4">
				{collections.map((col) => (
					<li
						key={col.id}
						className={`group duration-300 hover:bg-white/5 font-semibold bg-secondary py-3 px-4 flex justify-between items-center mb-2  rounded-lg ${selectedCollection === col.id ? "bg-white/5" : ""}`}
						onClick={() => setSelectedCollection(col.id)}
					>
						{col.data.label}
						<button
							onClick={(e) => {
								e.stopPropagation();
								onDeleteCollection(col.id);
							}}
						>
								<div className="duration-300 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto h-7 w-7 font-bold flex items-center justify-center"><Trash2 className="text-white/50" height={18} width={18} /></div>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default LeftSidebar;