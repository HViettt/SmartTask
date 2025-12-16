/**
 * Script test scheduler độc lập
 * Chạy: node scripts/testScheduler.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { processDeadlineNotifications } = require('../src/utils/taskScheduler');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const testScheduler = async () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🧪 TEST SCHEDULER - Deadline Notifications');
  console.log('═══════════════════════════════════════════════════\n');
  
  try {
    await connectDB();
    await processDeadlineNotifications();
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ Test completed successfully!');
    console.log('═══════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  }
};

testScheduler();
