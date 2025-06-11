import express, { Request, Response } from "express";
import connectDB from "./Config/Database_Connection";
import router_cart_item from "./Routes/Routes_Cart_Items";
import authRoutes from "./Routes/AuthRoutes";
import orderRoutes from "./Routes/OrderRoutes";
import payment_router from "./Routes/Razorpay_payment"
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from 'passport';

dotenv.config();

const app = express();

connectDB();

app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello, Welcome to the Backend API");
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", router_cart_item);
app.use("/razorpay", payment_router)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is Listening on Port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});