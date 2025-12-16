/**
 * ============================================================================
 * TASK SCHEDULER MODULE
 * ============================================================================
 * Mục đích: Hệ thống tự động quản lý task và lập lịch thông báo
 * 
 * Tính năng:
 * - Job 1: Gửi thông báo deadline mỗi ngày lúc 9:00 AM
 * - Job 2: Phát hiện task quá hạn mỗi 30 phút
 * - Gửi email cho công việc sắp tới hạn
 * - Cờ tránh gửi trùng lặp
 * 
 * Các job:
 *   1. notifyDeadlineJob: Thông báo các deadline trong 48 giờ tới
 *   2. checkOverdueJob: Kiểm tra và đánh dấu task quá hạn định kỳ
 * 
 * Cập nhật database:
 *   - Tạo notification với: userId, taskId, type, severity, message
 *   - Cập nhật task: status='Overdue', isOverdueNotified=true
 * 
 * Cách dùng:
 *   const scheduler = require('../utils/taskScheduler');
 *   scheduler.startScheduledJobs();  // Khởi động cùng server
 * 
 * Biến môi trường:
 *   EMAIL_USER, EMAIL_PASS: Thông tin Gmail để gửi thông báo
 * 
 * Author: System Implementation
 * Last Updated: December 16, 2025
 * ============================================================================
 */

const schedule = require('node-schedule');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = async (to, subject, htmlContent) => {
    const nodemailer = require('nodemailer');
    
    // Kiểm tra cấu hình email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ EMAIL không được cấu hình. Bỏ qua gửi thông báo deadline.');
        console.log(`📧 [DEV] Email đến ${to}: ${subject}`);
        return;
    }
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    
    try {
        await transporter.sendMail({
            from: `"SmartTask AI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        });
        console.log(`✅ Email deadline đã gửi đến ${to}`);
    } catch (error) {
        console.error('❌ Lỗi gửi email deadline:', error.message);
    }
};

/**
 * Format ngày giờ thành chuỗi dễ đọc
 */
const formatDate = (date) => {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh'
    };
    return new Date(date).toLocaleDateString('vi-VN', options);
};

/**
 * Tạo HTML email với danh sách công việc
 */
const createEmailHTML = (userName, upcomingTasks, overdueTasks) => {
    const upcomingHTML = upcomingTasks.length > 0 ? `
        <div style="margin: 20px 0;">
            <h3 style="color: #f59e0b; margin-bottom: 10px;">⚠️ Công việc sắp hết hạn (48 giờ tới):</h3>
            <ul style="list-style: none; padding: 0;">
                ${upcomingTasks.map(task => `
                    <li style="background: #fef3c7; padding: 12px; margin: 8px 0; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <strong style="color: #92400e;">${task.title}</strong>
                        <br/>
                        <span style="color: #78350f; font-size: 14px;">📅 Deadline: ${formatDate(task.deadline)}</span>
                        <br/>
                        <span style="color: #78350f; font-size: 12px;">⚡ Độ ưu tiên: ${task.priority} | 🎯 Độ phức tạp: ${task.complexity}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    ` : '';

    const overdueHTML = overdueTasks.length > 0 ? `
        <div style="margin: 20px 0;">
            <h3 style="color: #dc2626; margin-bottom: 10px;">🚨 Công việc đã quá hạn:</h3>
            <ul style="list-style: none; padding: 0;">
                ${overdueTasks.map(task => `
                    <li style="background: #fee2e2; padding: 12px; margin: 8px 0; border-left: 4px solid #dc2626; border-radius: 4px;">
                        <strong style="color: #991b1b;">${task.title}</strong>
                        <br/>
                        <span style="color: #7f1d1d; font-size: 14px;">📅 Deadline: ${formatDate(task.deadline)}</span>
                        <br/>
                        <span style="color: #7f1d1d; font-size: 12px;">⚡ Độ ưu tiên: ${task.priority} | 🎯 Độ phức tạp: ${task.complexity}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    ` : '';

    return `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thông báo Deadline</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">📋 SmartTask AI</h1>
                <p style="color: #e0e7ff; margin: 10px 0 0 0;">Thông báo Deadline Công việc</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #374151;">Xin chào <strong>${userName}</strong>,</p>
                <p style="font-size: 14px; color: #6b7280;">Đây là thông báo tự động về các công việc cần chú ý của bạn:</p>
                
                ${upcomingHTML}
                ${overdueHTML}
                
                <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                    <p style="margin: 0; font-size: 14px; color: #1e40af;">
                        💡 <strong>Gợi ý:</strong> Hãy ưu tiên hoàn thành các công việc đã quá hạn và lập kế hoạch cho các công việc sắp đến hạn.
                    </p>
                </div>
                
                <div style="margin-top: 30px; text-align: center;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        📊 Xem Dashboard
                    </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center;">
                    Email này được gửi tự động từ SmartTask AI<br/>
                    Bạn nhận được email này vì đã đăng ký tài khoản trên hệ thống của chúng tôi.
                </p>
            </div>
        </body>
        </html>
    `;
};

/**
 * HÀM CHÍNH: Xử lý gửi thông báo deadline
 */
const processDeadlineNotifications = async () => {
    try {
        console.log('\n🔄 [Scheduler] Bắt đầu kiểm tra deadline công việc...');
        
        const now = new Date();
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 giờ từ bây giờ
        
        // 1. Truy vấn tất cả công việc chưa hoàn thành có deadline
        const incompleteTasks = await Task.find({
            status: { $ne: 'Done' }, // Không phải Done
            deadline: { $exists: true, $ne: null } // Có deadline
        }).lean();
        
        console.log(`📋 Tìm thấy ${incompleteTasks.length} công việc chưa hoàn thành có deadline.`);
        
        // 2. Nhóm công việc theo userId
        const tasksByUser = {};
        
        incompleteTasks.forEach(task => {
            const taskDeadline = new Date(task.deadline);
            const userId = task.userId.toString();
            
            // Phân loại: Sắp hết hạn (48h) hoặc Đã quá hạn
            const isUpcoming = taskDeadline > now && taskDeadline <= in48Hours;
            const isOverdue = taskDeadline < now;
            
            if (isUpcoming || isOverdue) {
                if (!tasksByUser[userId]) {
                    tasksByUser[userId] = {
                        upcoming: [],
                        overdue: []
                    };
                }
                
                if (isUpcoming) {
                    tasksByUser[userId].upcoming.push(task);
                } else if (isOverdue) {
                    tasksByUser[userId].overdue.push(task);
                }
            }
        });
        
        const userIds = Object.keys(tasksByUser);
        console.log(`👥 Có ${userIds.length} người dùng cần nhận thông báo.`);
        
        // 3. Gửi email cho từng người dùng
        let emailsSent = 0;
        
        for (const userId of userIds) {
            try {
                const user = await User.findById(userId);
                
                if (!user || !user.email) {
                    console.warn(`⚠️ Không tìm thấy user hoặc email cho userId: ${userId}`);
                    continue;
                }
                
                const { upcoming, overdue } = tasksByUser[userId];
                const totalTasks = upcoming.length + overdue.length;
                
                // Tạo nội dung email
                const emailHTML = createEmailHTML(user.name, upcoming, overdue);
                const subject = `🔔 Thông báo: ${totalTasks} công việc cần chú ý`;

                // Gửi email
                await sendEmail(user.email, subject, emailHTML);
                emailsSent++;

                // Chuẩn hóa dữ liệu công việc để hiển thị chi tiết trong Notification Center
                const mapTask = (task) => ({
                    _id: task._id,
                    title: task.title,
                    deadline: task.deadline,
                    priority: task.priority,
                    complexity: task.complexity,
                    status: task.status
                });

                // Tạo thông báo trong DB (hiển thị được ngay trong Notification Center)
                await Notification.create({
                    userId: user._id,
                    type: 'email',
                    title: 'Tổng hợp deadline đã gửi qua Email',
                    message: `${totalTasks} công việc: ${overdue.length} quá hạn, ${upcoming.length} sắp hết hạn`,
                    severity: overdue.length > 0 ? 'critical' : 'warn',
                    metadata: {
                        emailSent: true,
                        upcomingCount: upcoming.length,
                        overdueCount: overdue.length,
                        upcoming: upcoming.map(mapTask),
                        overdue: overdue.map(mapTask)
                    }
                });
                
                console.log(`✉️ Đã gửi thông báo cho ${user.name} (${user.email}): ${upcoming.length} sắp hết hạn, ${overdue.length} quá hạn`);
                
            } catch (userError) {
                console.error(`❌ Lỗi khi xử lý user ${userId}:`, userError.message);
            }
        }
        
        console.log(`✅ [Scheduler] Hoàn thành! Đã gửi ${emailsSent}/${userIds.length} email thông báo.\n`);
        
    } catch (error) {
        console.error('❌ [Scheduler] Lỗi khi xử lý deadline notifications:', error);
    }
};

/**
 * HÀM: Kiểm tra và cập nhật Overdue status
 * Chạy mỗi 30 phút để đánh dấu các task quá hạn
 */
const checkAndUpdateOverdueTasks = async () => {
    try {
        const now = new Date();
        
        // Tìm các task quá hạn nhưng chưa được đánh dấu Overdue
        const overdueTasks = await Task.find({
            deadline: { $lt: now },
            status: { $in: ['Todo', 'Doing'] } // Chỉ cập nhật chưa hoàn thành
        });
        
        if (overdueTasks.length === 0) {
            console.log('✅ Không có task mới quá hạn');
            return;
        }
        
        console.log(`⚠️ Tìm thấy ${overdueTasks.length} task quá hạn`);
        
        // Cập nhật status thành Overdue và tạo notification
        for (const task of overdueTasks) {
            // Cập nhật status
            const oldStatus = task.status;
            task.status = 'Overdue';
            await task.save();
            
            console.log(`✅ Task "${task.title}" (${task._id}) đánh dấu Overdue`);
            
            // Tạo notification nếu chưa được thông báo
            if (!task.isOverdueNotified) {
                await Notification.create({
                    userId: task.userId,
                    type: 'task',
                    subtype: 'overdue',
                    title: '⚠️ Công việc quá hạn',
                    message: `"${task.title}" đã quá hạn từ ${formatDate(task.deadline)}`,
                    taskId: task._id,
                    severity: 'high',
                    metadata: {
                        task: {
                            _id: task._id,
                            title: task.title,
                            deadline: task.deadline,
                            priority: task.priority
                        },
                        oldStatus: oldStatus,
                        newStatus: 'Overdue'
                    }
                });
                
                task.isOverdueNotified = true;
                await task.save();
                
                console.log(`📢 Đã tạo notification cho user ${task.userId}`);
            }
        }
        
        console.log(`✅ Cập nhật ${overdueTasks.length} task sang Overdue status`);
        
    } catch (error) {
        console.error('❌ Lỗi kiểm tra overdue tasks:', error.message);
    }
};

/**
 * KHỞI TẠO SCHEDULED JOB
 * Chạy mỗi ngày lúc 9:00 AM + mỗi 30 phút check overdue
 */
const initializeScheduler = () => {
    // Job 1: Gửi thông báo deadline - Mỗi ngày lúc 9:00 AM
    const deadlineJob = schedule.scheduleJob('0 0 9 * * *', async () => {
        console.log(`⏰ [${new Date().toISOString()}] Scheduler triggered - Kiểm tra deadline`);
        await processDeadlineNotifications();
    });
    
    // Job 2: Kiểm tra overdue - Mỗi 30 phút
    const overdueJob = schedule.scheduleJob('*/30 * * * *', async () => {
        console.log(`⏰ [${new Date().toISOString()}] Checking overdue tasks...`);
        await checkAndUpdateOverdueTasks();
    });
    
    console.log('✅ Task Scheduler đã được khởi tạo:');
    console.log('   - Gửi thông báo deadline: Mỗi ngày lúc 9:00 AM');
    console.log('   - Kiểm tra overdue: Mỗi 30 phút');
    console.log('🔔 Thông báo deadline sẽ được gửi tự động cho công việc sắp hết hạn và quá hạn\n');
    
    return { deadlineJob, overdueJob };
};

/**
 * CHẠY THỬ NGAY LẬP TỨC (Development/Testing)
 */
const runImmediately = async () => {
    console.log('🧪 [TEST MODE] Chạy thử scheduler ngay lập tức...\n');
    await processDeadlineNotifications();
};

module.exports = {
    initializeScheduler,
    processDeadlineNotifications,
    checkAndUpdateOverdueTasks,
    runImmediately
};
