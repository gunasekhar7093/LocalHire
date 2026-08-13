const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateUser, 
  getUserById,
  adminLogin,
  getAllUsers,
  deleteUser,
  sendOtp,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Admin Routes (using protect middleware which verifies token, then controller checks if admin)
router.post('/admin-login', adminLogin);
router.get('/users', protect, getAllUsers);
router.delete('/user/:id', protect, deleteUser);

router.post('/send-otp', sendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateUser);
router.get('/user/:id', getUserById);

module.exports = router;
