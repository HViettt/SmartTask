/**
 * Task Scheduler Module - Optimized
 * Tự động quản lý task và lập lịch thông báo deadline
 */

const schedule = require('node-schedule');
const moment = require('moment-timezone');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const EmailDigestLog = require('../models/EmailDigestLog');
const { isTaskOverdue, getDeadlineStatus, formatDeadline, VN_TIMEZONE } = require('./deadlineHelper');
const { NOTIFICATION_TYPES, ACTIVE_TASK_STATUSES } = require('../common/constants');
const { buildDeadlineBucketsByTasks, getAllUsersDeadlineBuckets, getUserDeadlineBuckets, mapTaskSummary } = require('../services/deadlineService');

const sendEmail = async (to, subject, htmlContent) => {
    const nodemailer = require('nodemailer');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return { success: true, messageId: 'dev-mode-' + Date.now(), error: null };
    }
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    
    try {
        const info = await transporter.sendMail({
            from: `"SmartTask AI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        });
        return { success: true, messageId: info.messageId, error: null };
    } catch (error) {
        return { success: false, messageId: null, error: error.message };
    }
};
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

// Chuẩn hóa task vào metadata (chỉ các trường cần hiển thị)
// mapTaskSummary đã được tái sử dụng từ deadlineService để tránh trùng lặp logic

// So sánh nông (metadata nhỏ) để biết payload có đổi hay không
const isShallowEqual = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);

// Upsert 1 bản ghi duy nhất cho từng loại thông báo hệ thống
// Reset read=false CHỈ KHI payload thay đổi (để badge tăng đúng lúc)
// Upsert tối giản: chỉ lưu trạng thái hiển thị (read) và thời điểm kích hoạt
// KHÔNG lưu danh sách task để Notification không lệ thuộc dữ liệu
const upsertSystemNotification = async (userId, type, payload = {}) => {
    const selector = { userId, type, subtype: null };
    const existing = await Notification.findOne(selector).lean();

    // Chỉ so sánh những thuộc tính hiển thị đơn giản
    const payloadChanged = !existing
        || existing.title !== payload.title
        || existing.message !== payload.message
        || existing.severity !== payload.severity;

    if (!payloadChanged) {
        // Nếu dữ liệu không đổi, chỉ cập nhật lastTriggeredAt để theo dõi thời điểm check
        await Notification.updateOne(selector, { $set: { lastTriggeredAt: new Date() } });
        return existing;
    }

    return Notification.findOneAndUpdate(
        selector,
        {
            $set: {
                type,
                subtype: null,
                title: payload.title || 'Thông báo hệ thống',
                message: payload.message || '',
                severity: payload.severity || 'info',
                // Khi dashboard đổi → kích hoạt lại và đặt unread
                lastTriggeredAt: new Date(),
                read: false,
                // Xóa metadata phức tạp để tránh lưu danh sách task
                metadata: {}
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );
};

// Đồng bộ thông báo EMAIL_SENT từ bản ghi EmailDigestLog mới nhất
// ⚠️ KHÔNG hiển thị số lượng email do giới hạn kỹ thuật Gmail
// Chỉ thông báo trạng thái gửi thành công/thất bại
const syncEmailNotificationFromLog = async (log) => {
    if (!log) return;
    const severity = log.status === 'failed' ? 'warn' : 'info';
    const message = log.status === 'failed'
        ? 'Email nhắc việc gặp lỗi khi gửi'
        : 'Hệ thống đã gửi email nhắc việc đến hộp thư của bạn';

    await upsertSystemNotification(log.userId, NOTIFICATION_TYPES.EMAIL_SENT, {
        title: 'Thông báo qua Email',
        message,
        severity
    });
};

// Cập nhật 2 loại thông báo deadline (DUE_SOON, OVERDUE) dựa trên bucket sẵn có
const refreshUserDeadlineNotifications = async (userId, bucket, { fetchIfMissing = true } = {}) => {
    let upcoming = bucket?.upcoming || [];
    let overdue = bucket?.overdue || [];

    // Nếu không truyền bucket thì query lại theo đúng logic dashboard (status != Done, deadline with 48h / past)
    if (!bucket && fetchIfMissing) {
        const activeTasks = await Task.find({
            userId,
            status: { $ne: 'Done' },
            deadline: { $exists: true, $ne: null }
        }).lean();
        const computed = buildDeadlineBucketsByTasks(activeTasks).get(userId?.toString()) || { upcoming: [], overdue: [] };
        upcoming = computed.upcoming || [];
        overdue = computed.overdue || [];
    }

    // Đọc bản ghi hiện có để so sánh số lượng, tránh reset chéo
    // Lấy bản ghi mới nhất theo type (bỏ qua subtype để đọc cả dữ liệu legacy)
    const [dueSoonDoc, overdueDoc] = await Promise.all([
        Notification.findOne({ userId, type: NOTIFICATION_TYPES.DUE_SOON }).sort({ updatedAt: -1 }).lean(),
        Notification.findOne({ userId, type: NOTIFICATION_TYPES.OVERDUE }).sort({ updatedAt: -1 }).lean()
    ]);

    // Backend CHỈ lưu timestamp và read state, KHÔNG lưu count
    // Frontend sẽ tự tính count từ tasks (SOURCE OF TRUTH duy nhất)
    // Đọc count cũ từ metadata với fallback cho key legacy
    // Lý do: trước đây metadata dùng upcomingCount/overdueCount, về sau chuyển sang _trackCount
    // Nếu chỉ đọc _trackCount sẽ luôn = 0 với bản ghi cũ → gây trigger sai và reset timestamp chéo
    const safeCount = (val) => {
        const n = Number(val);
        return Number.isFinite(n) && n >= 0 ? n : 0;
    };
    const prevDueSoonCount = safeCount(
        dueSoonDoc?.metadata?.upcomingCount ?? dueSoonDoc?.metadata?._trackCount ?? 0
    );
    const prevOverdueCount = safeCount(
        overdueDoc?.metadata?.overdueCount ?? overdueDoc?.metadata?._trackCount ?? 0
    );
    const nextDueSoonCount = upcoming.length;
    const nextOverdueCount = overdue.length;
    const existedDueSoon = !!dueSoonDoc;
    const existedOverdue = !!overdueDoc;

    // ========================
    // DUE_SOON NOTIFICATION
    // ========================
    // CHỈ update khi DUE_SOON count THỰC SỰ thay đổi
    // Khi count thay đổi → set read=false (báo user có dữ liệu mới)
    if (nextDueSoonCount !== prevDueSoonCount) {
        const shouldMarkUnread = (nextDueSoonCount > prevDueSoonCount) || (!existedDueSoon && nextDueSoonCount > 0);
        await Notification.findOneAndUpdate(
            { userId, type: NOTIFICATION_TYPES.DUE_SOON, subtype: null },
            {
                $set: {
                    type: NOTIFICATION_TYPES.DUE_SOON,
                    subtype: null,
                    title: '⚠️ Công việc sắp hết hạn',
                    message: 'Danh sách công việc sắp hết hạn đã thay đổi',
                    severity: nextDueSoonCount > 0 ? 'warn' : 'info',
                    lastTriggeredAt: new Date(),
                    read: shouldMarkUnread ? false : (dueSoonDoc?.read ?? true),
                    metadata: { _trackCount: nextDueSoonCount, upcomingCount: nextDueSoonCount }
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }

    if (nextOverdueCount !== prevOverdueCount) {
        const shouldMarkUnread = (nextOverdueCount > prevOverdueCount) || (!existedOverdue && nextOverdueCount > 0);
        await Notification.findOneAndUpdate(
            { userId, type: NOTIFICATION_TYPES.OVERDUE, subtype: null },
            {
                $set: {
                    type: NOTIFICATION_TYPES.OVERDUE,
                    subtype: null,
                    title: '🚨 Công việc quá hạn',
                    message: 'Danh sách công việc quá hạn đã thay đổi',
                    severity: nextOverdueCount > 0 ? 'critical' : 'info',
                    lastTriggeredAt: new Date(),
                    read: shouldMarkUnread ? false : (overdueDoc?.read ?? true),
                    metadata: { _trackCount: nextOverdueCount, overdueCount: nextOverdueCount }
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    }
};

// ĐÃ DI CHUYỂN sang deadlineService.buildDeadlineBucketsByTasks để dùng chung Dashboard/Notifications

const getTodayDateVN = () => {
    return moment.tz(VN_TIMEZONE).format('YYYY-MM-DD');
};

const processDeadlineNotifications = async () => {
    try {
        console.log('📧 [Email Digest] Starting process...');
        const now = new Date();
        const today = new Date(now);
        today.setUTCHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setUTCDate(today.getUTCDate() + 1);
        
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const todayDateStr = getTodayDateVN();
        
        console.log(`📧 [Email Digest] Date: ${todayDateStr}`);
        
        const incompleteTasks = await Task.find({
            status: { $ne: 'Done' },
            deadline: { $exists: true, $ne: null }
        }).lean();

        console.log(`📧 [Email Digest] Found ${incompleteTasks.length} incomplete tasks with deadlines`);

        const bucketsByUser = buildDeadlineBucketsByTasks(incompleteTasks);
        const userIds = Array.from(bucketsByUser.keys());
        
        console.log(`📧 [Email Digest] Processing ${userIds.length} users`);
        
        let emailsSent = 0;
        let emailsSkipped = 0;
        let emailsFailed = 0;
        
        for (const userId of userIds) {
            try {
                const bucket = bucketsByUser.get(userId) || { upcoming: [], overdue: [] };
                await refreshUserDeadlineNotifications(userId, bucket);

                const user = await User.findById(userId);
                
                if (!user || !user.email) continue;
                
                if (user.notificationSettings && user.notificationSettings.emailNotifications === false) {
                    emailsSkipped++;
                    continue;
                }
                
                const existingLog = await EmailDigestLog.findOne({
                    userId: user._id,
                    digestDate: todayDateStr
                });
                
                if (existingLog) {
                    await syncEmailNotificationFromLog(existingLog);
                    emailsSkipped++;
                    continue;
                }
                
                const { upcoming, overdue } = bucket;
                const totalTasks = upcoming.length + overdue.length;
                
                const emailHTML = createEmailHTML(user.name, upcoming, overdue);
                const subject = `🔔 Thông báo: ${totalTasks} công việc cần chú ý`;

                const sendResult = await sendEmail(user.email, subject, emailHTML);
                
                const logEntry = {
                    userId: user._id,
                    digestDate: todayDateStr,
                    status: sendResult.success ? 'sent' : 'failed',
                    upcomingCount: upcoming.length,
                    overdueCount: overdue.length,
                    errorMessage: sendResult.error || null,
                    providerMessageId: sendResult.messageId || null,
                    sentAt: new Date()
                };
                
                const createdLog = await EmailDigestLog.create(logEntry);
                
                if (sendResult.success) {
                    emailsSent++;
                    await syncEmailNotificationFromLog(createdLog);
                } else {
                    emailsFailed++;
                }
                
            } catch (userError) {
                emailsFailed++;
                console.error(`❌ [Email Digest] Error for user ${userId}:`, userError.message);
            }
        }
        
        console.log(`📧 [Email Digest] Summary:`);
        console.log(`   ✅ Sent: ${emailsSent}`);
        console.log(`   ⏭️  Skipped: ${emailsSkipped}`);
        console.log(`   ❌ Failed: ${emailsFailed}`);
        
    } catch (error) {
        console.error('[Scheduler] Lỗi xử lý deadline notifications:', error.message);
    }
};

const checkAndUpdateOverdueTasks = async () => {
    try {
        const activeTasks = await Task.find({
            status: { $ne: 'Done' },
            deadline: { $exists: true, $ne: null }
        }).lean();

        const bucketsByUser = buildDeadlineBucketsByTasks(activeTasks);

        for (const [userId, bucket] of bucketsByUser.entries()) {
            await refreshUserDeadlineNotifications(userId, bucket);
        }
    } catch (error) {
        console.error('[Scheduler] Lỗi checkAndUpdateOverdueTasks:', error.message);
    }
};

const initializeScheduler = () => {
    console.log('⏰ [Scheduler] Initializing task scheduler...');
    console.log(`⏰ [Scheduler] Server time: ${new Date().toISOString()}`);
    console.log(`⏰ [Scheduler] VN time: ${moment.tz(VN_TIMEZONE).format('YYYY-MM-DD HH:mm:ss')}`);
    
    // Chạy lúc 2:00 AM UTC = 9:00 AM giờ VN (UTC+7)
    const deadlineJob = schedule.scheduleJob('0 0 2 * * *', async () => {
        console.log('📧 [Scheduler] Daily email digest started at:', new Date().toISOString());
        console.log('📧 [Scheduler] VN time:', moment.tz(VN_TIMEZONE).format('YYYY-MM-DD HH:mm:ss'));
        try {
            await processDeadlineNotifications();
            console.log('✅ [Scheduler] Daily email digest completed successfully');
        } catch (error) {
            console.error('❌ [Scheduler] Daily email digest failed:', error.message);
        }
    });
    
    // Kiểm tra overdue tasks mỗi 30 phút
    const overdueJob = schedule.scheduleJob('*/30 * * * *', async () => {
        console.log('🔄 [Scheduler] Checking overdue tasks...');
        try {
            await checkAndUpdateOverdueTasks();
            console.log('✅ [Scheduler] Overdue check completed');
        } catch (error) {
            console.error('❌ [Scheduler] Overdue check failed:', error.message);
        }
    });
    
    console.log('✅ [Scheduler] Scheduler initialized successfully');
    console.log('📅 [Scheduler] Email digest: Daily at 2:00 AM UTC (9:00 AM VN)');
    console.log('📅 [Scheduler] Overdue check: Every 30 minutes');
    
    return { deadlineJob, overdueJob };
};

const runImmediately = async () => {
    await processDeadlineNotifications();
};

module.exports = {
    initializeScheduler,
    processDeadlineNotifications,
    checkAndUpdateOverdueTasks,
    refreshUserDeadlineNotifications,
    runImmediately
};
