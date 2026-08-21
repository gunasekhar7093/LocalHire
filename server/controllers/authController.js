const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const dns = require('dns');

// Helper to send email using Resend (HTTPS API) or Nodemailer (Port 587 STARTTLS IPv4)
const sendMailHelper = async ({ to, subject, text }) => {
  // Option 1: Resend HTTP API (Bypasses SMTP port blocks on Cloud Hosts like Render)
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: 'LocalHire <onboarding@resend.dev>',
        to: [to],
        subject,
        text,
      });
      if (error) {
        console.error('Resend API error:', error);
        throw new Error(error.message || 'Resend email error');
      }
      return data;
    } catch (err) {
      console.error('Resend failed, falling back to Nodemailer SMTP:', err.message);
    }
  }

  // Option 2: Nodemailer with Port 587 (STARTTLS) and forced IPv4 lookup
  // Port 587 is unblocked on Render; custom lookup forces IPv4 to avoid ENETUNREACH
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    lookup: (hostname, options, callback) => {
      return dns.lookup(hostname, { family: 4 }, callback);
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000
  });

  const mailOptions = {
    from: `LocalHire <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  };

  return await transporter.sendMail(mailOptions);
};

// @desc    Send OTP
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP Email via sendMailHelper
    await sendMailHelper({
      to: email,
      subject: 'LocalHire Registration OTP',
      text: `Your OTP for registration is: ${otp}. It is valid for 5 minutes.`
    });

    // Save to DB
    await OTP.findOneAndDelete({ email }); // clear old OTP if exists
    await OTP.create({ email, otp });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error in sendOtp:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, otp } = req.body;

    // Validation
    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Please add all required fields including OTP' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not requested' });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    if (user) {
      // Delete OTP after successful registration
      await OTP.findOneAndDelete({ email });

      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        about: user.about,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        about: user.about,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, about } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (about !== undefined) updateData.about = about;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (updatedUser) {
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        about: updatedUser.about,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, stack: error.stack });
  }
};

// @desc    Get user by ID
// @route   GET /api/auth/user/:id
// @access  Public
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (email === 'admin@gmail.com' && password === '12345678') {
      res.json({
        _id: 'admin',
        name: 'Admin',
        email: 'admin@gmail.com',
        isAdmin: true,
        token: jwt.sign({ id: 'admin', isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1d' }),
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin (Checking in controller for simplicity)
exports.getAllUsers = async (req, res) => {
  try {
    // Basic authorization check based on token payload
    if (!req.user || req.user.id !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user and cascade delete (Admin only)
// @route   DELETE /api/auth/user/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.id !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascading Delete
    // 1. Delete all posts by user
    await Post.deleteMany({ userId: req.params.id });

    // 2. Find all conversations where user is a participant
    const conversations = await Conversation.find({ participants: req.params.id });
    const conversationIds = conversations.map(c => c._id);

    // 3. Delete all messages associated with those conversations
    if (conversationIds.length > 0) {
      await Message.deleteMany({ conversationId: { $in: conversationIds } });
    }

    // 4. Delete the conversations themselves
    await Conversation.deleteMany({ participants: req.params.id });

    // 5. Finally, delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User and all related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password (send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send Reset OTP Email via sendMailHelper
    await sendMailHelper({
      to: email,
      subject: 'LocalHire Password Reset OTP',
      text: `Your OTP for resetting your password is: ${otp}. It is valid for 5 minutes.`
    });

    // Save to DB
    await OTP.findOneAndDelete({ email }); // clear old OTP if exists
    await OTP.create({ email, otp });

    res.status(200).json({ message: 'Reset OTP sent successfully' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP' });
  }
};

// @desc    Reset password (verify OTP and update password)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    // Check OTP
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not requested' });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (pre-save hook will hash it)
    user.password = password;
    await user.save();

    // Delete OTP
    await OTP.findOneAndDelete({ email });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
