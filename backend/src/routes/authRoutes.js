const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAdminSetupStatus,
  setupAdminUser,
  generateRegistrationCode,
  getRegistrationCodes,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/admin/setup-status', getAdminSetupStatus);
router.post('/admin/setup', setupAdminUser);
router.post('/admin/codes/generate', protect, generateRegistrationCode);
router.get('/admin/codes', protect, getRegistrationCodes);
router.route('/profile').get(protect, getProfile).put(protect, updateProfile);

module.exports = router;
