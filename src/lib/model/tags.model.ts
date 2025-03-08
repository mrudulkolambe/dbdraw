import mongoose, { Model, Schema, model, models } from 'mongoose';

interface Tags {
	_id: string;
	user: string;
	title: string;
	description: string;
	createdAt: number;
	updatedAt?: Date;
}

interface TagsDocument extends Tags {}

const TAGS_SCHEMA = new Schema<TagsDocument>(
	{
		user: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: [2, 'Tag title must be at least 2 characters long'],
		},
		description: {
			type: String,
			default: '',
		},
		createdAt: {
			type: Number,
			default: () => Date.now(),
		},
	},
	{
		timestamps: true,
	}
);

// ✅ Ensures we don’t re-register the model on hot reload in Next.js
const Tags: Model<TagsDocument> = models.Tags || model<TagsDocument>('Tags', TAGS_SCHEMA);

export default Tags;
