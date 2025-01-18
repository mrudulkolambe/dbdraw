import { Edge, Node } from "@xyflow/react";

export const initialEdges: Edge[] = [];
export const initialNodes: Node[] = [
	{
		id: "1",
		zIndex: 100,
		draggable: true,
		position: {
			x: 100,
			y: 100,
		},
		data: {
			collection: {
				title: "New title"
			}
		},
		type: "collection"
	},
	{
		id: "2",
		draggable: true,
		zIndex: 100,
		position: {
			x: 200,
			y: 200,
		},
		data: {
			collection: {
				title: "New title"
			}
		},
		type: "collection"
	},
	{
		id: "3",
		draggable: true,
		zIndex: 100,
		position: {
			x: 300,
			y: 300,
		},
		data: {
			collection: {
				title: "New title"
			}
		},
		type: "collection"
	},
];