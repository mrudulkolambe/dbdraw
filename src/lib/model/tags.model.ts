import { Model, Schema, model, models } from 'mongoose';

interface Tags {
	_id: string;
	user: string;
	title: string;
	description: string;
	createdAt: number;
}

interface TagsDocument extends Tags { }

const TAGS_SCHEMA = new Schema<TagsDocument>({
	user: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		default: ""
	},
	createdAt: {
		type: Number,
		default: Date.now()
	}
})


const Tags: Model<TagsDocument> = models?.Tags || model<TagsDocument>("Tags", TAGS_SCHEMA);

export default Tags;