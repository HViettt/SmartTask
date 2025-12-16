/**
 * ============================================================================
 * TRANSLATION DICTIONARY DEFINITIONS
 * ============================================================================
 * Purpose: Define all UI strings in Vietnamese (vi) and English (en)
 * 
 * Structure:
 *   dictionaries = {
 *     vi: { key: 'Vietnamese text', nested: { key: 'text' } },
 *     en: { key: 'English text', nested: { key: 'text' } }
 *   }
 * 
 * ⚠️ IMPORTANT RULES:
 *   - Only translate UI elements and system messages
 *   - NEVER add user-generated content here
 *   - Keep translations consistent across both languages
 *   - Use hierarchical keys for organization
 *   - Avoid hardcoding user names, emails, or task titles
 * 
 * Structure Guidelines:
 *   - appName: App name and branding
 *   - nav: Navigation and menu items
 *   - auth: Authentication related messages
 *   - common: Common UI elements (buttons, labels)
 *   - tasks: Task management UI
 *   - dashboard: Dashboard UI
 *   - notifications: Notification related
 *   - statusLabels: Task status options
 *   - priorityLabels: Priority options
 *   - complexityLabels: Complexity options
 * 
 * Variables:
 *   - Use {variable} syntax: "Hello {name}"
 *   - Pass to t() function: t('greeting', { name: 'John' })
 * 
 * Author: System Implementation
 * Last Updated: December 16, 2025
 * ============================================================================
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useAuthStore } from '../features/useStore';

const dictionaries = {
  vi: {
    appName: 'SmartTask',
    nav: {
      dashboard: 'Dashboard',
      tasks: 'Công việc',
      notifications: 'Thông báo',
      settings: 'Cài đặt',
      changeLanguage: 'Đổi ngôn ngữ',
      toggleTheme: 'Chuyển theme',
      logout: 'Đăng xuất'
    },
    common: {
      add: 'Thêm mới',
      edit: 'Chỉnh sửa',
      delete: 'Xóa',
      save: 'Lưu',
      update: 'Cập nhật',
      cancel: 'Hủy',
      close: 'Đóng',
      back: 'Quay lại',
      loading: 'Đang tải...',
      searchPlaceholder: 'Tìm kiếm công việc...',
      all: 'Tất cả',
      markAllRead: 'Đánh dấu tất cả đã đọc',
      justNow: 'Vừa xong',
      minutesAgo: '{count} phút trước',
      hoursAgo: '{count} giờ trước',
      daysAgo: '{count} ngày trước',
      noDescription: 'Không có mô tả',
      completedAt: 'Hoàn thành',
      confirmDelete: 'Xóa công việc này?',
      error: 'Đã có lỗi xảy ra'
    },
    statusLabels: {
      todo: 'Chưa làm',
      doing: 'Đang làm',
      done: 'Hoàn thành'
    },
    priorityLabels: {
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp'
    },
    priorityShort: {
      high: 'Cao',
      medium: 'TB',
      low: 'Thấp'
    },
    complexityLabels: {
      hard: 'Khó',
      medium: 'Vừa',
      easy: 'Dễ'
    },
    severity: {
      info: 'Thông báo',
      warn: 'Cảnh báo',
      critical: 'Quan trọng'
    },
    tasks: {
      headerTitle: 'Danh sách công việc',
      headerSubtitle: 'Quản lý và theo dõi tiến độ công việc',
      aiSuggest: 'AI Gợi Ý Sắp Xếp',
      add: 'Thêm mới',
      filterAll: 'Tất cả',
      emptyTitle: 'Chưa có công việc nào',
      emptyDesc: 'Danh sách trống. Hãy thêm công việc mới hoặc thử thay đổi bộ lọc tìm kiếm.',
      emptyCta: 'Thêm công việc đầu tiên',
      formTitleCreate: 'Thêm công việc mới',
      formTitleEdit: 'Chỉnh sửa công việc',
      form: {
        title: 'Tiêu đề',
        titlePlaceholder: 'Ví dụ: Hoàn thành báo cáo...',
        deadline: 'Deadline',
        complexity: 'Độ phức tạp',
        status: 'Trạng thái',
        priority: 'Mức độ ưu tiên',
        description: 'Mô tả chi tiết',
        descriptionPlaceholder: 'Nhập mô tả chi tiết cho công việc...',
        notes: 'Ghi chú thêm',
        notesPlaceholder: 'Link tài liệu, ghi chú nhanh...'
      },
      quick: {
        start: 'Bắt đầu',
        complete: 'Hoàn thành ngay',
        reopen: 'Mở lại'
      },
      toasts: {
        created: '✅ Đã tạo',
        updated: '✏️ Đã cập nhật',
        deleted: '🗑️ Đã xóa',
        statusDone: '✅ Đã hoàn thành',
        statusReopen: '🔄 Đã mở lại',
        statusStart: '▶️ Bắt đầu',
        statusError: 'Không thể cập nhật trạng thái',
        saveError: 'Không thể lưu công việc',
        deleteError: 'Không thể xóa công việc',
        aiError: 'Có lỗi xảy ra khi gọi AI. Vui lòng thử lại sau.'
      }
    },
    dashboard: {
      title: 'Dashboard Tổng Quan',
      lastUpdated: 'Cập nhật lần cuối',
      filters: {
        label: 'Phạm vi thời gian',
        all: 'Tất cả',
        last7: '7 ngày gần đây',
        last30: '30 ngày gần đây'
      },
      statusTitle: 'Trạng thái công việc',
      upcomingTitle: 'Sắp đến hạn (3 ngày)',
      noUpcoming: 'Không có công việc nào sắp đến hạn.',
      stats: {
        total: 'Tổng công việc',
        todo: 'Chưa bắt đầu',
        doing: 'Đang thực hiện',
        done: 'Đã hoàn thành',
        overdue: 'Quá hạn',
        highPriority: 'Ưu tiên cao',
        completedToday: 'Hoàn thành hôm nay',
        sub: {
          todo: 'Status: Todo',
          doing: 'Status: Doing',
          done: 'Tỷ lệ: {percent}%',
          overdue: 'Deadline < hôm nay',
          highPriority: 'Chưa xong',
          completedToday: 'CompletedAt: hôm nay'
        }
      },
      modal: {
        title: 'Danh sách công việc',
        empty: 'Không có công việc trong phạm vi thời gian này.'
      }
    },
    alerts: {
      overdue: 'Bạn có {count} công việc quá hạn!',
      upcoming: 'Có {count} công việc sắp đến hạn trong 48 giờ tới'
    },
    notifications: {
      title: 'Thông báo',
      settings: 'Cài đặt',
      newCount: 'Bạn có {count} thông báo chưa đọc',
      moreCount: 'Bạn có {count} thông báo mới:',
      newGeneric: 'Bạn có {count} thông báo mới.',
      templates: {
        addedToList: 'đã được thêm vào danh sách của bạn',
        emailDigest: '{total} công việc: {overdue} quá hạn, {upcoming} sắp hết hạn',
        deadlineSoonCount: '{count} công việc sắp đến hạn',
        overdueCount: '{count} công việc quá hạn',
        taskCompletedSuffix: 'đã hoàn thành'
      },
      saveSuccess: 'Đã lưu cài đặt thông báo',
      saveError: 'Không thể lưu cài đặt',
      loadError: 'Không thể tải cài đặt',
      loading: 'Đang tải...',
      empty: 'Chưa có thông báo nào',
      types: {
        email: '📧 Email & Báo cáo',
        taskStatus: '📊 Trạng thái công việc',
        task: '📝 Công việc mới',
        deadline: '⏰ Deadline'
      },
      systemTitles: {
        emailSent: 'Đã gửi thông báo qua Email',
        taskCreated: 'Công việc mới được tạo',
        deadlineSoon: 'Sắp đến hạn',
        overdue: 'Quá hạn',
        taskCompleted: 'Công việc đã hoàn thành'
      },
      severity: {
        info: 'Thông báo',
        warn: 'Cảnh báo',
        critical: 'Quan trọng'
      },
      detail: {
        deadline: 'Deadline',
        email: 'Email',
        task: 'Task',
        overdue: 'Quá hạn ({count})',
        upcoming: 'Sắp hết hạn ({count})',
        taskDetail: 'Chi tiết công việc',
        priority: 'Ưu tiên',
        complexity: 'Độ phức tạp',
        status: 'Trạng thái',
        close: 'Đóng',
        openEmail: 'Mở email trong Gmail',
        openTask: 'Mở công việc'
      },
      settingsModal: {
        title: 'Cài đặt thông báo',
        subtitle: 'Tùy chỉnh cách bạn nhận thông báo',
        email: {
          title: 'Thông báo Gmail',
          desc: 'Nhận tổng hợp deadline qua email mỗi ngày'
        },
        taskAction: {
          title: 'Thông báo thao tác',
          desc: 'Hiện toast khi tạo, sửa, xóa công việc'
        },
        webEntry: {
          title: 'Thông báo khi vào web',
          desc: 'Hiện toast về task gần deadline khi mở web'
        },
        taskStatus: {
          title: 'Thông báo trạng thái task',
          desc: 'Lưu thông báo khi task thay đổi trạng thái'
        },
        saving: 'Đang lưu...',
        save: 'Lưu thay đổi',
        cancel: 'Hủy'
      }
    },
    auth: {
      login: {
        title: 'Chào mừng trở lại!',
        subtitle: 'Đăng nhập để tiếp tục quản lý công việc',
        email: 'Email',
        password: 'Mật khẩu',
        forgot: 'Quên mật khẩu?',
        submit: 'Đăng nhập',
        or: 'Hoặc tiếp tục với',
        noAccount: 'Chưa có tài khoản?',
        registerNow: 'Đăng ký ngay',
        googleError: 'Đăng nhập Google thất bại',
        googleInitError: 'Không thể khởi tạo Google Sign-In',
        emailPlaceholder: 'email@example.com',
        passwordPlaceholder: '••••••••'
      },
      register: {
        title: 'Đăng ký tài khoản',
        subtitle: 'Tạo tài khoản mới để quản lý công việc hiệu quả',
        name: 'Họ tên',
        email: 'Email',
        password: 'Mật khẩu',
        confirmPassword: 'Xác nhận mật khẩu',
        submit: 'Đăng ký',
        haveAccount: 'Đã có tài khoản?',
        loginNow: 'Đăng nhập ngay',
        passwordMismatch: 'Mật khẩu xác nhận không khớp!',
        namePlaceholder: 'Nguyễn Văn A',
        emailPlaceholder: 'email@example.com',
        passwordPlaceholder: '••••••••'
      },
      verify: {
        title: 'Xác minh Email',
        subtitle: 'Chúng tôi đã gửi mã xác minh gồm 6 chữ số đến email:',
        codeLabel: 'Mã xác minh',
        submit: 'Xác minh tài khoản',
        resend: 'Không nhận được mã? Gửi lại',
        successTitle: 'Xác minh thành công!',
        successDesc: 'Tài khoản của bạn đã được kích hoạt. Đang chuyển hướng...',
        missingEmail: 'Lỗi: Không tìm thấy email đăng ký. Vui lòng đăng ký lại.'
      },
      forgot: {
        back: 'Quay lại đăng nhập',
        title: 'Quên mật khẩu?',
        subtitle: 'Nhập email của bạn, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.',
        email: 'Email đăng ký',
        submit: 'Gửi yêu cầu',
        sentTitle: 'Đã gửi hướng dẫn',
        sentDesc: 'Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến và thư mục Spam.'
      },
      reset: {
        title: 'Đặt Lại Mật Khẩu',
        subtitle: 'Tạo mật khẩu mới để bảo mật tài khoản của bạn',
        newPassword: 'Mật khẩu mới',
        confirmPassword: 'Xác nhận Mật khẩu mới',
        submit: 'Đặt lại Mật khẩu',
        processing: 'Đang xử lý...',
        successTitle: 'Thành công!',
        successDesc: 'Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập với mật khẩu mới.',
        backToLogin: 'Quay lại Đăng nhập',
        invalidLink: 'Liên kết đặt lại mật khẩu không hợp lệ.',
        passwordMismatch: 'Mật khẩu xác nhận không khớp!'
      }
    }
  },
  en: {
    appName: 'SmartTask',
    nav: {
      dashboard: 'Dashboard',
      tasks: 'Tasks',
      notifications: 'Notifications',
      settings: 'Settings',
      changeLanguage: 'Change Language',
      toggleTheme: 'Toggle Theme',
      logout: 'Logout'
    },
    common: {
      add: 'Add New',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      update: 'Update',
      cancel: 'Cancel',
      close: 'Close',
      back: 'Back',
      loading: 'Loading...',
      searchPlaceholder: 'Search tasks...',
      all: 'All',
      markAllRead: 'Mark all as read',
      justNow: 'Just now',
      minutesAgo: '{count} minutes ago',
      hoursAgo: '{count} hours ago',
      daysAgo: '{count} days ago',
      noDescription: 'No description',
      completedAt: 'Completed',
      confirmDelete: 'Delete this task?',
      error: 'Something went wrong'
    },
    statusLabels: {
      todo: 'Todo',
      doing: 'Doing',
      done: 'Done'
    },
    priorityLabels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low'
    },
    priorityShort: {
      high: 'High',
      medium: 'Med',
      low: 'Low'
    },
    complexityLabels: {
      hard: 'Hard',
      medium: 'Medium',
      easy: 'Easy'
    },
    severity: {
      info: 'Info',
      warn: 'Warning',
      critical: 'Critical'
    },
    tasks: {
      headerTitle: 'Task List',
      headerSubtitle: 'Manage and track your work progress',
      aiSuggest: 'AI Sort Suggestion',
      add: 'Add New',
      filterAll: 'All',
      emptyTitle: 'No tasks yet',
      emptyDesc: 'Empty list. Add a new task or try changing filters.',
      emptyCta: 'Add the first task',
      formTitleCreate: 'Add new task',
      formTitleEdit: 'Edit task',
      form: {
        title: 'Title',
        titlePlaceholder: 'Example: Finish the report...',
        deadline: 'Deadline',
        complexity: 'Complexity',
        status: 'Status',
        priority: 'Priority',
        description: 'Detailed description',
        descriptionPlaceholder: 'Add more details for the task...',
        notes: 'Extra notes',
        notesPlaceholder: 'Links or quick notes...'
      },
      quick: {
        start: 'Start',
        complete: 'Complete now',
        reopen: 'Reopen'
      },
      toasts: {
        created: '✅ Created',
        updated: '✏️ Updated',
        deleted: '🗑️ Deleted',
        statusDone: '✅ Completed',
        statusReopen: '🔄 Reopened',
        statusStart: '▶️ Started',
        statusError: 'Unable to update status',
        saveError: 'Unable to save task',
        deleteError: 'Unable to delete task',
        aiError: 'AI request failed. Please try again later.'
      }
    },
    dashboard: {
      title: 'Overview Dashboard',
      lastUpdated: 'Last updated',
      filters: {
        label: 'Time range',
        all: 'All',
        last7: 'Last 7 days',
        last30: 'Last 30 days'
      },
      statusTitle: 'Task status',
      upcomingTitle: 'Due soon (3 days)',
      noUpcoming: 'No tasks are due soon.',
      stats: {
        total: 'Total tasks',
        todo: 'Not started',
        doing: 'In progress',
        done: 'Completed',
        overdue: 'Overdue',
        highPriority: 'High priority',
        completedToday: 'Completed today',
        sub: {
          todo: 'Status: Todo',
          doing: 'Status: Doing',
          done: 'Rate: {percent}%',
          overdue: 'Deadline < today',
          highPriority: 'Not done yet',
          completedToday: 'CompletedAt: today'
        }
      },
      modal: {
        title: 'Task list',
        empty: 'No tasks in this time range.'
      }
    },
    alerts: {
      overdue: 'You have {count} overdue tasks!',
      upcoming: '{count} tasks are due within 48 hours'
    },
    notifications: {
      title: 'Notifications',
      settings: 'Settings',
      newCount: 'You have {count} unread notifications',
      moreCount: 'You have {count} new notifications:',
      newGeneric: 'You have {count} new notifications.',
      templates: {
        addedToList: 'has been added to your list',
        emailDigest: '{total} tasks: {overdue} overdue, {upcoming} due soon',
        deadlineSoonCount: '{count} tasks are due soon',
        overdueCount: '{count} tasks are overdue',
        taskCompletedSuffix: 'has been completed'
      },
      saveSuccess: 'Notification settings saved',
      saveError: 'Unable to save settings',
      loadError: 'Unable to load settings',
      loading: 'Loading...',
      empty: 'No notifications yet',
      types: {
        email: '📧 Email & Reports',
        taskStatus: '📊 Task status',
        task: '📝 New tasks',
        deadline: '⏰ Deadlines'
      },
      systemTitles: {
        emailSent: 'Email digest sent',
        taskCreated: 'New task created',
        deadlineSoon: 'Deadline approaching',
        overdue: 'Overdue',
        taskCompleted: 'Task completed'
      },
      severity: {
        info: 'Info',
        warn: 'Warning',
        critical: 'Critical'
      },
      detail: {
        deadline: 'Deadline',
        email: 'Email',
        task: 'Task',
        overdue: 'Overdue ({count})',
        upcoming: 'Upcoming ({count})',
        taskDetail: 'Task details',
        priority: 'Priority',
        complexity: 'Complexity',
        status: 'Status',
        close: 'Close',
        openEmail: 'Open email in Gmail',
        openTask: 'Open task'
      },
      settingsModal: {
        title: 'Notification settings',
        subtitle: 'Customize how you receive alerts',
        email: {
          title: 'Gmail notifications',
          desc: 'Daily deadline digest via email'
        },
        taskAction: {
          title: 'Task action toasts',
          desc: 'Show toast when creating, updating, deleting tasks'
        },
        webEntry: {
          title: 'Web entry alerts',
          desc: 'Show toast about near-deadline tasks on web entry'
        },
        taskStatus: {
          title: 'Task status notifications',
          desc: 'Save notifications when task status changes'
        },
        saving: 'Saving...',
        save: 'Save changes',
        cancel: 'Cancel'
      }
    },
    auth: {
      login: {
        title: 'Welcome back!',
        subtitle: 'Log in to keep managing your tasks',
        email: 'Email',
        password: 'Password',
        forgot: 'Forgot password?',
        submit: 'Sign in',
        or: 'Or continue with',
        noAccount: "Don't have an account?",
        registerNow: 'Register now',
        googleError: 'Google sign-in failed',
        googleInitError: 'Cannot initialize Google Sign-In',
        emailPlaceholder: 'email@example.com',
        passwordPlaceholder: '••••••••'
      },
      register: {
        title: 'Create account',
        subtitle: 'Create a new account to manage tasks effectively',
        name: 'Full name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm password',
        submit: 'Sign up',
        haveAccount: 'Already have an account?',
        loginNow: 'Sign in now',
        passwordMismatch: 'Passwords do not match!',
        namePlaceholder: 'John Doe',
        emailPlaceholder: 'email@example.com',
        passwordPlaceholder: '••••••••'
      },
      verify: {
        title: 'Verify Email',
        subtitle: 'We sent a 6-digit code to:',
        codeLabel: 'Verification code',
        submit: 'Verify account',
        resend: "Didn't get the code? Resend",
        successTitle: 'Verified successfully!',
        successDesc: 'Your account is activated. Redirecting...',
        missingEmail: 'Error: Missing registration email. Please sign up again.'
      },
      forgot: {
        back: 'Back to login',
        title: 'Forgot password?',
        subtitle: 'Enter your email and we will send reset instructions.',
        email: 'Registered email',
        submit: 'Send request',
        sentTitle: 'Instructions sent',
        sentDesc: 'We sent reset instructions. Please check your inbox and spam folder.'
      },
      reset: {
        title: 'Reset Password',
        subtitle: 'Create a new password to secure your account',
        newPassword: 'New password',
        confirmPassword: 'Confirm new password',
        submit: 'Reset Password',
        processing: 'Processing...',
        successTitle: 'Success!',
        successDesc: 'Your password has been updated. You can now sign in with it.',
        backToLogin: 'Back to Login',
        invalidLink: 'Reset password link is invalid.',
        passwordMismatch: 'Passwords do not match!'
      }
    }
  }
};

const getStoredLang = () => {
  try {
    return localStorage.getItem('lang');
  } catch (e) {
    return null;
  }
};

const I18nContext = createContext({ t: (key) => key, lang: 'vi', locale: 'vi-VN' });

export const I18nProvider = ({ children }) => {
  const { user } = useAuthStore();
  const storedLang = getStoredLang();
  const langPref = user?.preferences?.language || storedLang;
  const lang = langPref === 'en' ? 'en' : 'vi';
  const locale = lang === 'en' ? 'en-US' : 'vi-VN';

  const dict = dictionaries[lang] || dictionaries.vi;

  const t = (key, vars) => {
    const parts = key.split('.');
    let cur = dict;
    for (const p of parts) {
      cur = cur?.[p];
      if (cur === undefined) return key;
    }
    if (typeof cur === 'string' && vars) {
      return cur.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
    }
    return cur;
  };

  const value = useMemo(() => ({ t, lang, locale }), [t, lang, locale]);
  return React.createElement(I18nContext.Provider, { value }, children);
};

export const useI18n = () => useContext(I18nContext);
