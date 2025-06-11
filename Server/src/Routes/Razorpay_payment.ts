import express, {Request, Response} from "express"
import Razorpay from "razorpay"
import dotenv from "dotenv"

const payment_router = express.Router();
dotenv.config();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
    // headers: {
    //   "X-Razorpay-Account": "<merchant_account_id>"
    // }
  });

  const Process_Payment = async(req: Request, res: Response): Promise<void> => {
    const options = {
      amount : Number(req.body.amount * 100),
      currency : "INR"
    }
    const order = await instance.orders.create(options)

    res.status(200).json({
      success: true,
      order
    })
  }

  const Get_Key = async(req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      key : process.env.RAZORPAY_API_KEY
    })
  }
 
  payment_router.route("/payment/process").post(Process_Payment)
  payment_router.route("/getkey").get(Get_Key)


  export default payment_router