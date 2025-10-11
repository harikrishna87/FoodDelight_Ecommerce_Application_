import { Request, Response, NextFunction } from 'express';
import User from '../Models/Users';
import sendToken from '../Utils/jwt';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import { Readable } from 'stream';

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

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
    const user = await User.create({
      name,
      email,
      password,
      role: email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
    });
    sendToken(user, 201, res);
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

export { register, login, logout, getMe, updateProfile, uploadImage, updatePassword, DeleteAccount };