import mongoose, {Schema} from "mongoose";
import { IProduct, IRating } from "../Types";

const RatingSchema = new Schema<IRating>({
  rate: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
}, { _id: false });

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required.'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required.'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required.'],
      min: [0, 'Price cannot be negative.'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required.'],
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required.'],
    },
    rating: {
      type: RatingSchema,
      default: () => ({ rate: 0, count: 0 }),
    },
    ingredients: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 20;
        },
        message: 'Maximum 20 ingredients allowed.'
      }
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative.'],
      max: [10000, 'Calories seems too high.'],
      default: null
    },
    ageRecommendation: {
      type: String,
      trim: true,
      maxlength: [100, 'Age recommendation cannot exceed 100 characters.'],
      default: null
    }
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>('products', ProductSchema);

export default Product;