/**
 * ============================================================================
 * AUTH CONTROLLER MODULE
 * ============================================================================
 * Mục đích: Xử lý tất cả thao tác xác thực (đăng nhập, đăng ký, đặt lại mật khẩu)
 * 
 * Tính năng:
 * - Đăng ký email/password với OTP
 * - Đăng nhập email/password
 * - Đăng nhập Google OAuth với liên kết tài khoản tự động
 * - Quy trình đặt lại mật khẩu với token bảo mật
 * - Quản lý token phiên (JWT)
 * - Xử lý avatar (chỉ lấy từ Google OAuth, local dùng mặc định)
 * 
 * Endpoints:
 *   POST /api/auth/register - Tạo tài khoản mới
 *   POST /api/auth/verify-email - Xác minh email bằng OTP
 *   POST /api/auth/login - Đăng nhập email/password
 *   POST /api/auth/google-login - Đăng nhập Google OAuth
 *   POST /api/auth/forgot-password - Yêu cầu đặt lại mật khẩu
 *   PUT /api/auth/reset-password/:token - Đặt lại mật khẩu
 *   GET /api/auth/profile - Lấy hồ sơ người dùng hiện tại
 * 
 * Bảo mật:
 *   - Mật khẩu được hash bằng bcrypt (10 rounds)
 *   - Token được hash SHA256 trước khi lưu
 *   - Bắt buộc xác minh email trước khi đăng nhập
 *   - Token đặt lại hết hạn sau 1 giờ
 *   - Mã xác minh hết hạn sau 15 phút
 * 
 * Author: System Implementation
 * Last Updated: December 16, 2025
 * ============================================================================
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

// Khởi tạo client Google OAuth từ biến môi trường
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Hàm tạo JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Avatar mặc định (placeholder)
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name={name}&background=random&color=fff&bold=true&size=96';

// Hàm tạo URL avatar mặc định dựa trên tên user
const getDefaultAvatar = (name) => {
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&bold=true&size=96`;
};

// Chuẩn hóa dữ liệu user trước khi trả về FE
const getCleanUser = (user) => {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || getDefaultAvatar(user.name), // Fallback to default avatar
        preferences: user.preferences,
        isVerified: user.isVerified,
    };
};

// Email Transporter (SMTP Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Tiện ích: Gửi email hoặc log mô phỏng nếu cấu hình sai
const sendEmail = async (to, subject, htmlContent) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('===========================================================');
        console.warn('⚠️ EMAIL WARNING: EMAIL_USER or EMAIL_PASS not set in .env.');
        console.warn('📧 [DEV EMAIL SIMULATION]');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content: ${htmlContent.replace(/<[^>]*>/g, '').substring(0, 300)}...`);
        console.warn('===========================================================');
        return;
    }
    
    try {
        await transporter.sendMail({
            from: `"SmartTask AI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent, // Sử dụng html thay vì text
        });
        console.log(`✅ Email sent to ${to}`);
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw new Error('Lỗi khi gửi email xác nhận. Vui lòng kiểm tra cấu hình SMTP.');
    }
};

// @mota    Đăng ký tài khoản mới
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    // 1. Kiểm tra user đã tồn tại
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'Người dùng đã tồn tại.' });
    }

    try {
        // 2. Tạo User mới (password được hash qua middleware 'pre' trong User.js)
        // QUAN TRỌNG: Không set avatar cho local signup - chỉ dùng default
        const user = await User.create({
            name,
            email,
            password,
            // avatar: undefined - local users không có avatar, sẽ dùng default
        });

        if (user) {
            // 3. TẠO VÀ LƯU VERIFICATION CODE VÀO DB
            // Thay vì getVerificationToken(), dùng getVerificationCode() mới
            const verificationCode = user.getVerificationCode(); 
            await user.save();

            // 4. Gửi Email (Gửi Code thay vì URL)
            // Thay vì tạo URL, gửi CODE
            const message = `Chào mừng ${user.name},\n\nMã xác minh email của bạn là: ${verificationCode}\n\nVui lòng nhập mã này vào trang web để hoàn tất đăng ký. Mã sẽ hết hạn sau 15 phút.`;

            // Gọi hàm gửi email
            await sendEmail(
                user.email,
                'Mã xác minh Email của SmartTask AI',
                message
            );

            // 5. Trả về thông báo thành công (kèm user.email để FE biết)
            res.status(201).json({
                message: `Đăng ký thành công. Vui lòng kiểm tra email: ${user.email} để nhận mã xác minh.`,
                user: getCleanUser(user)
            });

        } else {
            res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ.' });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký.' });
    }
};
// @mota    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // 1. Tìm user (cần .select('+password') vì password mặc định ẩn)
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // 2. Kiểm tra email đã xác minh
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Tài khoản chưa được xác minh. Vui lòng kiểm tra email của bạn.' });
            }

            // 3. Đăng nhập thành công
            res.status(200).json({
                user: getCleanUser(user),
                token: generateToken(user._id),
                message: 'Đăng nhập thành công.',
            });
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }
    } catch (error) {
        next(error);
    }
};

// @mota    Xác minh email bằng mã
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res, next) => {
    // Frontend gửi email và code, không dùng token
    const { email, code } = req.body; 

    // 1. Băm code nhận được từ Frontend
    const hashedCode = crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');

    try {
        // 2. Tìm User bằng email, token đã hash và còn hạn
        const user = await User.findOne({
            email, // Tìm kiếm theo email để tối ưu
            verificationToken: hashedCode,
            resetPasswordExpires: { $gt: Date.now() }, // Dùng lại trường expires
        });

        if (!user) {
            // Lỗi 400: Mã không hợp lệ/Hết hạn
            return res.status(400).json({ 
                message: 'Mã xác minh không hợp lệ hoặc đã hết hạn.' 
            });
        }

        // 3. Xác minh thành công
        user.isVerified = true;
        user.verificationToken = undefined; // Xóa token
        user.resetPasswordExpires = undefined; // Xóa thời hạn
        
        await user.save();
        
        // 4. Đăng nhập tự động (Tạo token và trả về)
        res.json({
            message: 'Xác minh email thành công. Tài khoản của bạn đã được kích hoạt.',
            user: getCleanUser(user),
            token: generateToken(user._id), // Trả token để tự động đăng nhập
        });

    } catch (error) {
        console.error('Verify Email Error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi xác minh email.' });
    }
};
// @mota    Khởi tạo quy trình quên mật khẩu
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng với email này.' });
        }

        // 1. TẠO TOKEN MỚI:
        const resetToken = crypto.randomBytes(32).toString('hex'); // Token thô để gửi qua email
        
        // 2. HASH TOKEN: Lưu vào DB để an toàn
        // Dùng SHA256 để hash token thô
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // 3. LƯU HASHED TOKEN + THỜI HẠN VÀO DB
        user.resetPasswordToken = hashedToken; // Lưu token đã hash
        user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ

        await user.save({ validateBeforeSave: false }); 

        // 4. GỬI EMAIL: Dùng token thô để tạo URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        const message = `Bạn đang yêu cầu đặt lại mật khẩu. Vui lòng truy cập đường link sau để hoàn tất quá trình: ${resetUrl}`;

        await sendEmail(
            user.email,
            'Yêu cầu Đặt lại Mật khẩu',
            message
        );
        
        res.json({ message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi yêu cầu đặt lại mật khẩu.' });
    }
};

// @mota    Đặt lại mật khẩu (từ trang reset-password)
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    const { token } = req.params; // Token thô từ URL
    const { password } = req.body; // Mật khẩu mới

    // 1. HASH TOKEN TỪ URL: Dùng SHA256 giống lúc lưu
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken: hashedToken, // Tìm kiếm bằng hashed token
            resetPasswordExpires: { $gt: Date.now() }, // Kiểm tra token còn hạn
        });

        if (!user) {
            // Lỗi xảy ra nếu token không khớp Hashed Token trong DB hoặc đã hết hạn
            return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
        }

        // 2. Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 3. Xóa các trường token (vô hiệu hóa link)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // 4. Lưu user
        await user.save();

        res.json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi đặt lại mật khẩu. Vui lòng thử lại sau.' });
    }
};

// @mota    Đăng nhập/Đăng ký qua Google
// @route   POST /api/auth/google-login
// @access  Public
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body; // Lấy mật khẩu mới

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Kiểm tra token còn hạn
        });

        if (!user) {
            // Lỗi này sẽ được Frontend bắt và hiển thị thông báo
            return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
        }

        // 1. Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 2. Xóa các trường token (để link không dùng được nữa)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // 3. Lưu user
        await user.save();

        // 4. Phản hồi thành công
        res.json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi đặt lại mật khẩu. Vui lòng thử lại sau.' });
    }
};

// @mota    Đăng nhập/Đăng ký bằng Google ID Token
// @route   POST /api/auth/google-login
// @access  Public
exports.loginGoogle = async (req, res, next) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ message: 'Google credential bị thiếu.' });
    }

    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('GOOGLE_CLIENT_ID missing in backend env');
            return res.status(500).json({ message: 'Server missing Google Client ID' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });
        const payload = ticket.getPayload();
        
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (user) {
            // 1. User đã tồn tại
            if (!user.googleId) {
                // Chỉ update googleId nếu chưa có
                user.googleId = googleId;
            }
            // QUAN TRỌNG: Chỉ update avatar nếu user chưa có avatar từ trước
            // (tức là user này được tạo qua local signup sau đó connect Google)
            if (!user.avatar) {
                user.avatar = picture; // Set avatar từ Google ONLY nếu chưa có
            }
            
            // 2. Tự động xác minh nếu chưa xác minh (vì Google là nguồn đáng tin cậy)
            if (!user.isVerified) {
                user.isVerified = true;
                user.verificationToken = undefined; // Xóa token xác minh cũ nếu có
            }
            await user.save();
        } else {
            // 3. Tạo user mới từ thông tin Google
            // QUAN TRỌNG: Avatar ONLY từ Google, không từ email domain
            user = await User.create({
                googleId,
                email,
                name,
                avatar: picture, // Set avatar từ Google OAuth token
                password: undefined, // Không cần password cho tài khoản OAuth
                isVerified: true, // Email Google đã được xác minh
                preferences: { theme: 'light', language: 'vi' }
            });
        }

        // 4. Trả về token và user info
        res.json({
            user: getCleanUser(user),
            token: generateToken(user._id),
            message: 'Đăng nhập Google thành công.'
        });

    } catch (error) {
        console.error('Google Login Error:', error?.message || error);
        res.status(401).json({ message: 'Xác minh Google token thất bại. ' + (error?.message || '') });
    }
};

// @desc    Get current user profile (for token check)
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json(getCleanUser(user));
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};