import { Document } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  getJwtToken: () => string;
}

export type OrderDeliveryStatus = 'Pending' | 'Shipped' | 'Delivered';

export interface ICartItem {
  _id?: string;
  name: string;
  image: string;
  original_price: number;
  discount_price: number;
  quantity: number;
  category: string;
  description?: string;
}

export interface ICart extends Document {
  items: ICartItem[];
}

export interface IOrderItem {
  name: string;
  image: string;
  original_price: number;
  discount_price: number;
  quantity: number;
  category: string;
}

export interface IOrder extends Document {
  user: IUser['_id'];
  items: IOrderItem[];
  totalAmount: number;
  deliveryStatus: OrderDeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}