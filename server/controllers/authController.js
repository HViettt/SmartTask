
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Yêu cầu cài: npm install bcryptjs
const crypto = require('crypto'); // Built-in Node module

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_dev', {
    expiresIn: '30d',
  });
};

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Verification Token (Simulated)
    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      isVerified: false 
    });

    if (user) {
      // Trong thực tế: Gửi email chứa link verify.
      // Ở đây: Trả về token để test
      console.log(`>>> SIMULATED EMAIL: Verify Link for ${email}: /verify-email?token=${verificationToken}`);
      
      res.status(201).json({
        message: 'Đăng ký thành công. Vui lòng kiểm tra email (console log server) để xác thực.',
        verificationToken: verificationToken // Dev only: trả về để test
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đăng nhập bằng mật khẩu
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password || ''))) {
      if (!user.isVerified) {
         return res.status(401).json({ message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Xác thực email
// @route   POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Mã xác thực không hợp lệ hoặc đã hết hạn.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Xác thực thành công. Bạn có thể đăng nhập ngay bây giờ.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Quên mật khẩu (Gửi token reset)
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
    }

    // Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Simulate Email
    console.log(`>>> SIMULATED EMAIL: Reset Password Token for ${email}: ${resetToken}`);

    res.json({ message: 'Đã gửi hướng dẫn đặt lại mật khẩu vào email của bạn (Check console log).' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Giả lập đăng nhập Google (Cho môi trường Dev/Test)
// @route   POST /api/auth/google-callback-simulation
exports.loginSimulation = async (req, res) => {
  const { email, name, googleId, avatar } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        googleId,
        name,
        email,
        avatar,
        isVerified: true, // Google login auto verified
        preferences: { theme: 'light', language: 'vi' }
      });
    } else {
        // Nếu user đã tồn tại (đăng ký bằng pass trước đó), link googleId
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      preferences: user.preferences,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
