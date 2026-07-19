/**
 * Script seed test user + tasks for digest verification
 * Usage: node scripts/seedTestUser.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Task = require('../src/models/Task');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedTestData = async () => {
  try {
    await connectDB();

    // 1. Create or update test user
    const testEmail = 'digest-test@example.com';
    const testName = 'Digest Test User';

    let user = await User.findOne({ email: testEmail });
    if (!user) {
      user = await User.create({
        name: testName,
        email: testEmail,
        password: 'TestPassword123!',
        googleId: `test-google-${Date.now()}`, // Use unique googleId to avoid E11000
        isVerified: true,
        notificationSettings: {
          emailNotifications: true,
          taskActionToasts: true,
          webEntryAlerts: true,
          deadlineNotifications: true
        }
      });
    } else {
      if (!user.notificationSettings) {
        user.notificationSettings = {};
      }
      user.notificationSettings.emailNotifications = true;
      user.notificationSettings.deadlineNotifications = true;
      user.isVerified = true;
      await user.save();
    }

    // 2. Create tasks
    const now = new Date();

    // Task 1: Overdue (3 days ago)
    const overdueDeadline = new Date(now);
    overdueDeadline.setDate(overdueDeadline.getDate() - 3);

    // Task 2: Due within 48 hours (20 hours from now)
    const upcomingDeadline = new Date(now);
    upcomingDeadline.setHours(upcomingDeadline.getHours() + 20);

    const tasks = [
      {
        userId: user._id,
        title: '🔴 OVERDUE: Complete quarterly report',
        description: 'This task is 3 days overdue to test digest notifications',
        deadline: overdueDeadline,
        priority: 'High',
        complexity: 'Medium',
        status: 'Todo',
        notes: 'Test task for digest notifications'
      },
      {
        userId: user._id,
        title: '🟡 DUE SOON: Prepare presentation slides',
        description: 'Due in ~20 hours to test digest notifications',
        deadline: upcomingDeadline,
        priority: 'High',
        complexity: 'Easy',
        status: 'Doing',
        notes: 'Test task for digest notifications'
      }
    ];

    // Delete existing tasks for this user
    await Task.deleteMany({ userId: user._id, title: /OVERDUE|DUE SOON/ });

    for (const taskData of tasks) {
      await Task.create(taskData);
    }

  } catch (error) {
    console.error('Seed failed:', error?.message || error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedTestData();
