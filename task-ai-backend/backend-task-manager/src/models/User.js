const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto'); // Cần cho token

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true }, 
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, select: false },
  avatar: { type: String },
  hasPassword: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, enum: ['vi', 'en'], default: 'vi' }
  },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    taskActionToasts: { type: Boolean, default: true },
    webEntryAlerts: { type: Boolean, default: true },
    taskStatusNotifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true 
});

// PRE-SAVE HOOK: Băm (hash) mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
    // 1. Nếu không phải là tài khoản mới và mật khẩu không được thay đổi, skip.
    if (!this.isModified('password')) {
        return next();
    }
    
    // 2. Nếu mật khẩu là chuỗi rỗng (từ Google Login), set về undefined và skip hashing.
    if (this.password === '') { 
        this.password = undefined; 
        return next();
    }

    // 3. Nếu có mật khẩu mới, băm nó và set hasPassword flag.
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.hasPassword = true;
    next();
});

// METHOD: So sánh mật khẩu
userSchema.methods.matchPassword = async function(enteredPassword) {
    // Phải query lại user với trường password để so sánh
    if (!this.password) return false; 
    return await bcrypt.compare(enteredPassword, this.password);
};

// METHOD: Tạo reset token
userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Băm token (cho an toàn) và lưu vào database
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Thiết lập thời gian hết hạn (ví dụ: 15 phút)
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    return resetToken; // Trả về token gốc để gửi qua email
};

// METHOD: Tạo verification token
userSchema.methods.getVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Băm token và lưu vào database
    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    return verificationToken; // Trả về token gốc để gửi qua email
};

// METHOD: Tạo mã xác minh 6 chữ số (OTP)
userSchema.methods.getVerificationCode = function() {
    // Tạo mã 6 chữ số ngẫu nhiên
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 

    // Băm mã (cho an toàn) và lưu vào database
    this.verificationToken = crypto
        .createHash('sha256')
        .update(verificationCode)
        .digest('hex');

    // Thiết lập thời gian hết hạn (ví dụ: 15 phút là tốt nhất cho OTP)
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Có thể dùng lại trường expires

    return verificationCode; // Trả về code gốc (6 chữ số) để gửi qua email
};

module.exports = mongoose.model('User', userSchema);