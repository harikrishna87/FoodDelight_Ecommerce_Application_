import mongoose, { Document, Schema } from "mongoose";
import { ICartItem, ICart } from "../Types";

const CartItemSchema: Schema = new Schema<ICartItem>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  original_price: { type: Number, required: true },
  discount_price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String }
}, { _id: true });

const CartSchema: Schema = new Schema<ICart>({
  items: { type: [CartItemSchema], default: [] }
}, { timestamps: true });

const Cart = mongoose.model<ICart>("Cart", CartSchema);
export { ICartItem };
export default Cart;