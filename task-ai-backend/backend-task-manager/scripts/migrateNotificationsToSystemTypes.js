/**
 * Migration: Chuẩn hóa type thông báo sang 3 loại hệ thống
 * Chạy: node scripts/migrateNotificationsToSystemTypes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../src/models/Notification');
const { NOTIFICATION_TYPES } = require('../src/common/constants');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const migrate = async () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔧 MIGRATE NOTIFICATIONS -> EMAIL_SENT / DUE_SOON / OVERDUE');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    await connectDB();

    const bulkOps = [];

    const cursor = Notification.find({}).cursor();
    for await (const n of cursor) {
      let newType = null;
      if (n.type === 'email') newType = NOTIFICATION_TYPES.EMAIL_SENT;
      else if (n.type === 'task-status' && n.subtype === 'deadline-soon') newType = NOTIFICATION_TYPES.DUE_SOON;
      else if (n.type === 'task-status' && n.subtype === 'overdue') newType = NOTIFICATION_TYPES.OVERDUE;
      else if (n.type === NOTIFICATION_TYPES.EMAIL_SENT || n.type === NOTIFICATION_TYPES.DUE_SOON || n.type === NOTIFICATION_TYPES.OVERDUE) newType = n.type;

      if (!newType) continue; // bỏ qua các loại khác

      bulkOps.push({
        updateOne: {
          filter: { _id: n._id },
          update: {
            $set: {
              type: newType,
              subtype: null
            }
          }
        }
      });
    }

    if (bulkOps.length > 0) {
      const res = await Notification.bulkWrite(bulkOps);
      console.log(`✅ Đã cập nhật ${res.modifiedCount} bản ghi.`);
    } else {
      console.log('ℹ️ Không có bản ghi cần cập nhật.');
    }

    console.log('\n✅ Migration completed.');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  }
};

migrate();
