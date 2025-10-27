import { Request, Response, NextFunction } from 'express';
import User from '../Models/Users';
import sendToken from '../Utils/jwt';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import { Readable } from 'stream';
import nodemailer from 'nodemailer';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const otpStore = new Map<string, { otp: string; userData: any; expiresAt: number }>();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: `"FoodDelights" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Email Verification OTP - FoodDelights',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Times New Roman', Times, serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Logo/Header -->
                  <tr>
                    <td style="padding: 50px 40px 30px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #52c41a; font-size: 32px; font-weight: 600; font-family: 'Times New Roman', Times, serif;">
                        🍽️ FoodDelights
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 60px 40px 60px;">
                      <h2 style="margin: 0 0 24px 0; color: #1a1a1a; font-size: 24px; font-weight: 600; text-align: center; font-family: 'Times New Roman', Times, serif;">
                        Verify your FoodDelights sign-up
                      </h2>
                      <p style="margin: 0 0 32px 0; color: #4a4a4a; font-size: 15px; line-height: 1.6; text-align: center; font-family: 'Times New Roman', Times, serif;">
                        We have received a sign-up attempt with the following code. Please enter it in the browser window where you started signing up for FoodDelights.
                      </p>
                      
                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <div style="background-color: #f5f5f5; border-radius: 12px; padding: 32px; margin: 0 auto; max-width: 400px;">
                              <p style="margin: 0; color: #52c41a; font-size: 48px; font-weight: 600; letter-spacing: 6px; text-align: center; font-family: 'Times New Roman', Times, serif;">
                                ${otp}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 32px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6; text-align: center; font-family: 'Times New Roman', Times, serif;">
                        If you did not attempt to sign up but received this email, please disregard it. The code will remain active for 10 minutes.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 60px;">
                      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 40px 0;">
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 0 60px 50px 60px; text-align: center;">
                      <p style="margin: 0 0 20px 0; color: #999999; font-size: 14px; line-height: 1.6; font-family: 'Times New Roman', Times, serif;">
                        FoodDelights, an effortless food delivery solution with all the features you need.
                      </p>
                      <p style="margin: 20px 0 0 0; color: #cccccc; font-size: 13px; font-family: 'Times New Roman', Times, serif;">
                        © ${new Date().getFullYear()} FoodDelights. All rights reserved.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please enter all fields' });
      return;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists' });
      return;
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, {
      otp,
      userData: { name, email, password },
      expiresAt,
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      email,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: 'Please provide email and OTP' });
      return;
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      res.status(400).json({ success: false, message: 'OTP expired or invalid' });
      return;
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      res.status(400).json({ success: false, message: 'OTP has expired' });
      return;
    }

    if (storedData.otp !== otp) {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
      return;
    }

    const { name, email: userEmail, password } = storedData.userData;

    const user = await User.create({
      name,
      email: userEmail,
      password,
      role: userEmail === process.env.ADMIN_EMAIL ? 'admin' : 'user',
    });

    otpStore.delete(email);

    sendToken(user, 201, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resendOTP = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Please provide email' });
      return;
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      res.status(400).json({ success: false, message: 'No pending verification for this email' });
      return;
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(email, {
      ...storedData,
      otp,
      expiresAt,
    });

    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please enter email and password' });
      return;
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    sendToken(user, 200, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const logout = (req: Request, res: Response, next: NextFunction): void => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        shippingAddress: user.shippingAddress,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadImage = async (req: MulterRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No image file provided' });
      return;
    }

    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'user_profiles',
        resource_type: 'auto',
        public_id: `user_${user._id}_${Date.now()}`,
      },
      async (error, result) => {
        if (error) {
          res.status(500).json({ success: false, message: 'Image upload failed' });
          return;
        }

        const updatedUser = await User.findByIdAndUpdate(
          user._id,
          { image: result?.secure_url },
          { new: true }
        );

        res.status(200).json({
          success: true,
          message: 'Image uploaded successfully',
          image: result?.secure_url,
          user: {
            _id: updatedUser?._id,
            name: updatedUser?.name,
            email: updatedUser?.email,
            role: updatedUser?.role,
            image: updatedUser?.image,
            shippingAddress: updatedUser?.shippingAddress,
          },
        });
      }
    );

    const stream = Readable.from(req.file.buffer);
    stream.pipe(uploadStream);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { shippingAddress } = req.body;

    const updateData: any = {};
    if (shippingAddress) updateData.shippingAddress = shippingAddress;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
        shippingAddress: updatedUser.shippingAddress,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Please enter current and new passwords' });
      return;
    }

    const userWithPassword = await User.findById(user._id).select('+password');
    if (!userWithPassword) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await userWithPassword.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid current password' });
      return;
    }

    userWithPassword.password = newPassword;
    await userWithPassword.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const DeleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { password } = req.body;
    if (!password) {
      res.status(400).json({ success: false, message: 'Please enter your password to confirm account deletion' });
      return;
    }

    const userWithPassword = await User.findById(user._id).select('+password');
    if (!userWithPassword) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await userWithPassword.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid password' });
      return;
    }

    if (user.image) {
      try {
        const imageUrl = user.image;
        const publicIdMatch = imageUrl.match(/user_profiles\/user_[^.]+/);
        if (publicIdMatch) {
          await cloudinary.v2.uploader.destroy(publicIdMatch[0]);
        }
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
      }
    }

    await User.findByIdAndDelete(user._id);

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Please enter email address' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: 'Please check your email address' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      res.status(400).json({ success: false, message: 'Please enter email and new password' });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { register, login, logout, getMe, updateProfile, uploadImage, updatePassword, DeleteAccount, verifyEmail, resetPassword, verifyOTP, resendOTP };