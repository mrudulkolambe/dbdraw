import { Field } from '@/components/nodes/CollectionNode';
import mongoose, { Model, model, models, Schema } from 'mongoose';

export interface Flow {
	nodes: any[];
	edges: any[];
	viewport: {
		x: number;
		y: number;
		zoom: number;
	};
}

interface Diagram {
	_id: string;
	user: string;
	title: string;
	tag: {
		_id: string;
		title: string;
	};
	description?: string;
	flow: Flow;
	archived: boolean;
	createdAt: number;
	favourite: boolean;
	deleted: boolean;
	isTemplate: boolean;
	icon: string;
}

interface Collection {
	collectionName: string;
	data: {
		fields: Field[];
	}
}

interface DiagramDocument extends Diagram { }

const DRAW_SCHEMA = new Schema<DiagramDocument>({
	user: {
		type: String,
		required: true
	},
	tag: {
		type: Schema.Types.ObjectId,
		ref: "Tags",
		required: true
	},
	title: {
		type: String,
		default: "Untitled",
		required: true
	},
	flow: {
		type: Map,
		default: {
			nodes: [],
			edges: [],
			viewport: {
				x: 0,
				y: 0,
				zoom: 1
			}
		}
	},
	archived: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Number,
		default: Date.now
	},
	favourite: {
		type: Boolean,
		default: false
	},
	deleted: {
		type: Boolean,
		default: false
	},
	description: {
		type: String,
		default: ""
	},
	isTemplate: {
		type: Boolean,
		default: false
	},
	icon: {
		type: String,
		default: 'LuDatabase'
	}
})

const Diagrams: Model<DiagramDocument> = models?.Diagrams || model<DiagramDocument>("Diagrams", DRAW_SCHEMA);

export default Diagrams;
export type { Diagram, DiagramDocument, Collection };