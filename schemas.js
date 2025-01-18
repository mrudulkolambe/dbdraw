
		const mongoose = require("mongoose");
		
		
		const UsersSchema = new mongoose.Schema({
				firstname: { type: String, required: true, default: "" },
		lastname: { type: String, required: true, default: "" },
		email: { type: String, required: true, unique: true, default: "" },
		password: { type: String, required: true, default: "" },
		profile: { type: String, default: "https://dummyimage.com/300x300/eeeeee/000000.png" },
		username: { type: String, required: true, default: "" },
		cart: { type: mongoose.Schema.Types.ObjectId, ref: "items" }
		});
		
		const Users = mongoose.model("users", UsersSchema);
		

		const ProductsSchema = new mongoose.Schema({
				category: { type: mongoose.Schema.Types.ObjectId, ref: "categories", required: true },
		title: { type: String, required: true, default: "" },
		description: { type: String, default: "" },
		slug: { type: String, required: true, unique: true, default: "" },
		price: { type: Number, required: true, default: "" },
		available: { type: Boolean, default: "true" },
		banner: { type: String, required: true, default: "" },
		images: { type: String, default: "" }
		});
		
		const Products = mongoose.model("products", ProductsSchema);
		

		const CategoriesSchema = new mongoose.Schema({
				name: { type: String, required: true, default: "" },
		description: { type: String, default: "" },
		image: { type: String, required: true, default: "" }
		});
		
		const Categories = mongoose.model("categories", CategoriesSchema);
		

		const ReviewsSchema = new mongoose.Schema({
				rating: { type: Number, default: "5" },
		text: { type: String, default: "" },
		user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
		product: { type: mongoose.Schema.Types.ObjectId, ref: "products" }
		});
		
		const Reviews = mongoose.model("reviews", ReviewsSchema);
		

		const OrdersSchema = new mongoose.Schema({
				user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
		line_items: { type: mongoose.Schema.Types.ObjectId, ref: "items", required: true },
		subtotal: { type: Number, required: true, default: "" },
		total: { type: Number, default: "" },
		address: { type: mongoose.Schema.Types.ObjectId, ref: "addresses", required: true },
		status: { type: String, default: "init" }
		});
		
		const Orders = mongoose.model("orders", OrdersSchema);
		

		const AddressesSchema = new mongoose.Schema({
				user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
		address_line_1: { type: String, required: true, default: "" },
		address_line_2: { type: String, default: "" },
		city: { type: String, required: true, default: "" },
		region: { type: String, required: true, default: "" },
		postal_code: { type: String, required: true, default: "" },
		country: { type: String, required: true, default: "" }
		});
		
		const Addresses = mongoose.model("addresses", AddressesSchema);
		

		const ItemsSchema = new mongoose.Schema({
				product: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
		quantity: { type: Number, required: true, default: "1" }
		});
		
		const Items = mongoose.model("items", ItemsSchema);
		
		module.exports = { Users, Products, Categories, Reviews, Orders, Addresses, Items };
	