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
const { sendEmail } = require('../utils/email');
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
        createdAt: user.createdAt,
        isGoogleUser: !!user.googleId,
        hasPassword: user.hasPassword || false,
    };
};

// Gửi email (dùng util chung)
const sendVerificationEmail = async (to, name, code) => {
    const emailContent = `
                <html>
                    <body>
                        <h2>Chào mừng ${name},</h2>
                        <p>Mã xác minh email của bạn là:</p>
                        <h1 style="color: #10b981; font-family: monospace; letter-spacing: 2px;">${code}</h1>
                        <p>Vui lòng nhập mã này vào trang web để hoàn tất đăng ký.</p>
                        <p><strong>Mã sẽ hết hạn sau 15 phút.</strong></p>
                        <p>SmartTask AI Team</p>
                    </body>
                </html>
            `;
    return await sendEmail(to, 'Mã xác minh Email của SmartTask AI', emailContent);
};

// @mota    Đăng ký tài khoản mới
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    const { name, email, password } = req.body;

    // Kiểm tra input
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên, email và mật khẩu.' });
    }

    // 1. Kiểm tra user đã tồn tại
    const userExists = await User.findOne({ email });

    if (userExists) {
        if (!userExists.isVerified) {
            // Tài khoản tồn tại nhưng chưa xác minh → gửi lại mã và trả thông báo hướng dẫn
            const code = userExists.getVerificationCode();
            userExists.verificationLastSentAt = new Date();
            await userExists.save();
            await sendVerificationEmail(userExists.email, userExists.name, code);
            return res.status(200).json({
                message: `Email đã tồn tại nhưng chưa xác minh. Đã gửi lại mã tới: ${userExists.email}.`,
                registeredEmail: userExists.email,
                user: getCleanUser(userExists)
            });
        }
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
            // Gửi email xác minh (không block response)
            sendVerificationEmail(user.email, user.name, verificationCode).then((result) => {
                // Email sent asynchronously
            }).catch(err => {
                // Email send failed (non-critical)
            });

            // 5. Trả về thông báo thành công (kèm user.email để FE biết)
            // QUAN TRỌNG: Trả về registeredEmail để FE biết email nào cần xác minh
            res.status(201).json({
                message: `Đăng ký thành công. Vui lòng kiểm tra email: ${user.email} để nhận mã xác minh.`,
                registeredEmail: user.email,
                user: getCleanUser(user)
            });

        } else {
            res.status(400).json({ message: 'Dữ liệu người dùng không hợp lệ.' });
        }
    } catch (error) {
        console.error('Register Error:', error.message);
        // Kiểm tra lỗi validation từ MongoDB
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email này đã được đăng ký.' });
        }
        res.status(500).json({ message: 'Lỗi máy chủ khi đăng ký. ' + error.message });
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
// @mota    GỬI LẠI MÃ XÁC MINH EMAIL (RESEND OTP)
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Thiếu email.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Tài khoản đã được xác minh.' });
        }

        // Throttle: 60s giữa các lần gửi
        const now = Date.now();
        const lastSent = user.verificationLastSentAt ? new Date(user.verificationLastSentAt).getTime() : 0;
        if (lastSent && now - lastSent < 60 * 1000) {
            const waitSec = Math.ceil((60 * 1000 - (now - lastSent)) / 1000);
            return res.status(429).json({ message: `Vui lòng thử lại sau ${waitSec}s.` });
        }

        // Tạo mã mới và gửi
        const code = user.getVerificationCode();
        user.verificationLastSentAt = new Date();
        await user.save();

        const result = await sendVerificationEmail(user.email, user.name, code);
        if (!result.success) {
            return res.status(500).json({ message: 'Không thể gửi email xác minh. Vui lòng thử lại sau.' });
        }

        return res.json({ message: 'Đã gửi lại mã xác minh. Vui lòng kiểm tra email.' });
    } catch (error) {
        console.error('Resend Verification Error:', error?.message || error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi gửi lại mã xác minh.' });
    }
};
// @mota    QUÊN MẬT KHẨU - GỬI MÃ XÁC MINH (OTP)
// Luồng: FE gửi email -> BE tạo mã 6 chữ số, lưu hash + hạn dùng -> Gửi email chứa mã
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng với email này.' });
        }

        // 1) Tạo mã OTP 6 chữ số và lưu hash vào resetCode (hạn 10 phút)
        const code = user.getResetCode();
        await user.save({ validateBeforeSave: false });

        // 2) Gửi email hướng dẫn (KHÔNG lộ mã trên URL)
        const html = `
            <p>Xin chào ${user.name},</p>
            <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản SmartTask.</p>
            <p><strong>Mã xác minh (OTP): ${code}</strong></p>
            <p>Mã có hiệu lực trong 10 phút và chỉ dùng 1 lần.</p>
            <p>Vui lòng quay lại ứng dụng và nhập mã này để đặt mật khẩu mới.</p>
            <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        `;

        try {
            await sendEmail(user.email, 'Mã đặt lại mật khẩu - SmartTask', html);
        } catch (emailError) {
            console.error('❌ Lỗi gửi email OTP:', emailError);
            // Không fail toàn bộ: người dùng có thể bấm gửi lại
        }

        // 3) Trả kết quả
        res.json({ message: 'Đã gửi mã xác minh đặt lại mật khẩu tới email của bạn.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi yêu cầu đặt lại mật khẩu.' });
    }
};

// @mota    ĐẶT LẠI MẬT KHẨU BẰNG MÃ OTP
// FE gửi: { email, code, password }
// Kiểm tra: hash(code) == resetCode && resetCodeExpires > now
// @route   PUT /api/auth/reset-password
// @access  Public
exports.resetPasswordByCode = async (req, res) => {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
        return res.status(400).json({ message: 'Thiếu email, mã xác minh hoặc mật khẩu mới.' });
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    try {
        const user = await User.findOne({
            email,
            resetCode: hashedCode,
            resetCodeExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Mã xác minh không hợp lệ hoặc đã hết hạn.' });
        }

        // Cập nhật mật khẩu mới (pre-save hook sẽ hash)
        user.password = password;
        user.clearResetCode();
        await user.save();

        // 🔐 Trả token + user info để auto-login ngay sau khi đặt lại mật khẩu
        res.json({
            message: 'Đặt lại mật khẩu thành công.',
            user: getCleanUser(user),
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi đặt lại mật khẩu.' });
    }
};

// ⚠️ XÓA duplicate resetPassword handler cũ (token-based) để tránh nhầm lẫn

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
            if (!user.avatar || user.avatar.includes('ui-avatars.com')) {
                user.avatar = picture; // Set avatar từ Google
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
