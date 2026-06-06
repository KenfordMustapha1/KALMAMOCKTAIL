const User = require('../models/User');
const RegistrationCode = require('../models/RegistrationCode');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res) => {
  try {
    const { name, registrationCode, password } = req.body;

    if (!name || !registrationCode || !password) {
      return res.status(400).json({ message: 'Name, registration code, and password are required' });
    }

    // Validate registration code format (2 letters + 2 numbers)
    if (!/^[A-Z]{2}\d{2}$/.test(registrationCode)) {
      return res.status(400).json({ message: 'Invalid registration code format. Must be 2 letters + 2 numbers (e.g., AB12)' });
    }

    // Check if registration code exists and is unused
    const codeRecord = await RegistrationCode.findOne({ code: registrationCode.toUpperCase() });
    if (!codeRecord) {
      return res.status(400).json({ message: 'Invalid registration code' });
    }

    if (codeRecord.used) {
      return res.status(400).json({ message: 'This registration code has already been used' });
    }

    // Check if user with this registration code already exists
    const userExists = await User.findOne({ registrationCode: registrationCode.toUpperCase() });
    if (userExists) {
      return res.status(400).json({ message: 'This registration code is already taken' });
    }

    // Create user with registration code
    const user = await User.create({
      name,
      registrationCode: registrationCode.toUpperCase(),
      password,
    });

    // Mark registration code as used
    codeRecord.used = true;
    codeRecord.usedBy = user._id;
    await codeRecord.save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      registrationCode: user.registrationCode,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAdminSetupStatus = async (req, res) => {
  try {
    const adminExists = (await User.countDocuments({ role: 'admin' })) > 0;
    res.json({ adminExists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const setupAdminUser = async (req, res) => {
  try {
    const adminExists = (await User.countDocuments({ role: 'admin' })) > 0;
    if (adminExists) {
      return res.status(403).json({ message: 'Admin setup is no longer available' });
    }

    const { name, email, password } = req.body;
    const normalizedEmail = email?.toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'admin',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        registrationCode: updatedUser.registrationCode,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Generate a unique 2-letter + 2-number registration code
const generateUniqueCode = async () => {
  let code;
  let exists = true;
  
  while (exists) {
    // Generate random 2 letters
    const letters = String.fromCharCode(65 + Math.random() * 26, 65 + Math.random() * 26);
    // Generate random 2 numbers
    const numbers = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    code = `${letters}${numbers}`;
    
    // Check if code already exists
    exists = await RegistrationCode.findOne({ code });
  }
  
  return code;
};

const generateRegistrationCode = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can generate registration codes' });
    }

    const { quantity = 1 } = req.body;

    if (quantity < 1 || quantity > 100) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 100' });
    }

    const codes = [];
    for (let i = 0; i < quantity; i++) {
      const code = await generateUniqueCode();
      const registrationCode = await RegistrationCode.create({
        code,
        createdBy: req.user._id,
      });
      codes.push({
        _id: registrationCode._id,
        code: registrationCode.code,
        used: registrationCode.used,
      });
    }

    res.status(201).json({
      message: `${quantity} registration code(s) generated successfully`,
      codes,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getRegistrationCodes = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view registration codes' });
    }

    const { status = 'all' } = req.query; // 'all', 'unused', 'used'

    let query = {};
    if (status === 'unused') {
      query.used = false;
    } else if (status === 'used') {
      query.used = true;
    }

    const codes = await RegistrationCode.find(query)
      .populate('usedBy', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(codes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  getAdminSetupStatus,
  setupAdminUser,
  generateRegistrationCode,
  getRegistrationCodes,
};
