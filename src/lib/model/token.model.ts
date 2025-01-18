import { Model, Schema, model, models } from 'mongoose';

interface Tokens {
	_id: string;
	user: string;
	title: string;
	createdAt: number;
	token: string
}

interface TokensDocument extends Tokens { }

const TOKEN_SCHEMA = new Schema<TokensDocument>({
	user: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	createdAt: {
		type: Number,
		default: Date.now()
	},
	token: {
		type: String,
		required: true
	}
})


const Tokens: Model<TokensDocument> = models?.Tokens || model<TokensDocument>("Tokens", TOKEN_SCHEMA);

export default Tokens;