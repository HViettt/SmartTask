const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ header
            token = req.headers.authorization.split(' ')[1];

            // Xác minh token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Tìm user và gán vào req.user (không lấy password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                 return res.status(401).json({ message: 'Không tìm thấy người dùng.' });
            }
            
            // Kiểm tra user đã verify email chưa
            if (!req.user.isVerified) {
                 return res.status(401).json({ message: 'Tài khoản chưa được xác minh. Vui lòng kiểm tra email.' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Không có token, không được phép truy cập.' });
    }
};

module.exports = { protect };