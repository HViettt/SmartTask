/**
 * ============================================================================
 * XỬ LỲ LỖI MIDDLEWARE
 * ============================================================================
 * Mục đích: Xử lý tập trung tất cả các lỗi từ API endpoints
 * 
 * Tính năng:
 * - Ghi nhật ký lỗi với timestamp
 * - Trả về các response lỗi nhất quán
 * - Xử lý lỗi validation
 * - Xử lý lỗi database (MongoDB)
 * - Xử lý lỗi xác thực (JWT)
 * - Xử lý các lỗi không mong đợi
 * 
 * Cách sử dụng: app.use(errorHandler) ở cuối tất cả middleware khác
 * 
 * Format Response:
 * {
 *   success: false,
 *   status: <http_code>,
 *   message: <error_message>,
 *   details: <thông_tin_thêm> (chỉ trong development)
 * }
 * 
 * ============================================================================
 */

/**
 * Middleware xử lý lỗi toàn cục
 * PHẢI là middleware cuối cùng trong chuỗi middleware
 */
const errorHandler = (err, req, res, next) => {
  // Kiểm tra môi trường development hay production
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Ghi nhật ký lỗi với thông tin chi tiết
  console.error('❌ LỖI:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    status: err.status || 500,
    message: err.message,
    ...(isDevelopment && { stack: err.stack }),
  });

  // Xử lý lỗi validation của Mongoose (kiểu dữ liệu, required fields, etc)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      status: 400,
      message: 'Lỗi Xác Thực Dữ Liệu',
      details: isDevelopment ? messages : undefined,
    });
  }

  // Xử lý lỗi khóa trùng (ví dụ: email đã tồn tại)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      status: 409,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} đã tồn tại`,
    });
  }

  // Xử lý lỗi JWT không hợp lệ
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Token không hợp lệ',
    });
  }

  // Xử lý lỗi token hết hạn
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Token đã hết hạn',
    });
  }

  // Xử lý các lỗi custom khác
  const status = err.status || 500;
  const message = err.message || 'Lỗi Máy Chủ Nội Bộ';

  res.status(status).json({
    success: false,
    status,
    message,
    // Chỉ gửi stack trace trong môi trường development (để bảo mật)
    ...(isDevelopment && { details: err.stack }),
  });
};

module.exports = errorHandler;


