import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Otp from '../models/otp.model.js';
import { generateOtp } from '../utils/otp.util.js';
import { sendOtpEmail } from '../services/email.service.js';
import { generateToken } from '../middlewares/auth.middleware.js';

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: 'USER',
      status: false
    });

    const otp = generateOtp();

    await Otp.create({
      userId: user._id,
      otp,
      purpose: 'VERIFY_EMAIL',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendOtpEmail(email, otp);

    res.status(201).json({
      message: 'Registration successful. OTP sent to email.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otpRecord = await Otp.findOne({
      userId: user._id,
      otp,
      purpose: 'VERIFY_EMAIL'
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    user.status = true;
    await user.save();

    await Otp.deleteMany({ userId: user._id, purpose: 'VERIFY_EMAIL' });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status) {
      return res.status(400).json({ message: 'User already verified' });
    }

    await Otp.deleteMany({ userId: user._id, purpose: 'VERIFY_EMAIL' });

    const otp = generateOtp();

    await Otp.create({
      userId: user._id,
      otp,
      purpose: 'VERIFY_EMAIL',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.status) {
    return res.status(403).json({ message: 'Email not verified' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken({
    userId: user._id,
    role: user.role
  });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    }
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  await Otp.deleteMany({ userId: user._id, purpose: 'RESET_PASSWORD' });

  const otp = generateOtp();

  await Otp.create({
    userId: user._id,
    otp,
    purpose: 'RESET_PASSWORD',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  await sendOtpEmail(email, otp);

  res.json({ message: 'OTP sent to email for password reset' });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const otpRecord = await Otp.findOne({
    userId: user._id,
    otp,
    purpose: 'RESET_PASSWORD'
  });

  if (!otpRecord) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  if (otpRecord.expiresAt < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  await Otp.deleteMany({ userId: user._id, purpose: 'RESET_PASSWORD' });

  res.json({ message: 'Password reset successful' });
};

export const getMyProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  res.json(user);
};

export const updateMyProfile = async (req, res) => {
  const { firstName, lastName, phoneNumber } = req.body;

  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phoneNumber) user.phoneNumber = phoneNumber;

  await user.save();

  res.json({ message: 'Profile updated', user });
};

export const listUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const query = { status: true };
  const users = await User.find(query)
    .select('-password')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments();

  res.json({
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    users
  });
};

export const getUserById = async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    status: true
  });
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json(user);
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (typeof status !== 'boolean') {
      return res.status(400).json({ message: 'status must be boolean' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({
      message: 'User status updated successfully',
      status: user.status
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

