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
      profile: 'Hồ sơ',
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
      saving: 'Đang lưu...',
      update: 'Cập nhật',
      cancel: 'Hủy',
      close: 'Đóng',
      back: 'Quay lại',
      loading: 'Đang tải...',
      created: 'Tạo lúc',
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
      confirm: 'Xác nhận',
      error: 'Đã có lỗi xảy ra',
      prev: 'Trước',
      next: 'Sau'
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
      warning: 'Cảnh báo',
      critical: 'Quan trọng'
    },
    tasks: {
      headerTitle: 'Danh sách công việc',
      headerSubtitle: 'Quản lý và theo dõi tiến độ công việc',
      aiSuggest: 'Sắp xếp',
      add: 'Thêm mới',
      filterAll: 'Tất cả',
      emptyTitle: 'Chưa có công việc nào',
      emptyDesc: 'Danh sách trống. Hãy thêm công việc mới hoặc thử thay đổi bộ lọc tìm kiếm.',
      emptyCta: 'Thêm công việc đầu tiên',
      tabActive: 'Đang hoạt động',
      tabDeleted: 'Lưu trữ tạm',
      confirmDeleteTitle: 'Xác nhận xóa',
      confirmDeleteMessage: 'Bạn có chắc chắn muốn xóa "{title}"? Công việc sẽ được chuyển vào lưu trữ tạm trong {days} ngày trước khi bị xóa vĩnh viễn.',
      emptyState: {
        archiveTitle: 'ARCHIVE_EMPTY: KHÔNG CÓ CÔNG VIỆC',
        archiveMessage: 'BẢN GHI LƯU TRỮ TẠM KHÔNG PHÁT HIỆN DỮ LIỆU TRONG 30 NGÀY QUA.',
        systemTitle: 'SYSTEM_LOG: TRỐNG',
        systemMessageEmpty: 'KHÔNG TÌM THẤY DỮ LIỆU KHỞI CHẠY. BẮT ĐẦU BẰNG CÁCH TẠO CÔNG VIỆC MỚI.',
        systemMessageFiltered: 'KHÔNG PHÁT HIỆN DỮ LIỆU PHÙ HỢP VỚI BỘ LỌC HIỆN TẠI.'
      },
      formTitleCreate: 'Thêm công việc mới',
      formTitleEdit: 'Chỉnh sửa công việc',
      detailTitle: 'Chi tiết công việc',
      editTitle: 'Chỉnh sửa công việc',
      form: {
        title: 'Tiêu đề',
        titlePlaceholder: 'Ví dụ: Hoàn thành báo cáo...',
        deadline: 'Deadline',
        time: 'Thời gian',
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
      success: {
        updated: 'Đã cập nhật công việc thành công!'
      },
      errors: {
        titleRequired: 'Vui lòng nhập tiêu đề công việc',
        deadlineRequired: 'Vui lòng chọn deadline',
        updateFailed: 'Không thể cập nhật công việc. Vui lòng thử lại.'
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
        revertNotice: 'Không thể cập nhật vì công việc đang ở trạng thái xoá tạm.',
        restoreError: 'Khôi phục thất bại. Vui lòng thử lại.',
        restored: 'Công việc đã được khôi phục.',
        aiError: 'Có lỗi xảy ra khi gọi AI. Vui lòng thử lại sau.'
      },
      aiInput: {
        title: 'TẠO NHANH BẰNG AI PILOT',
        placeholder: 'Ví dụ: "Thứ 2 tuần sau vào 9 sáng họp nhóm dự án AI, ưu tiên cao"',
        submit: 'PHÂN TÍCH BẰNG AI',
        parsing: 'ĐANG PHÂN TÍCH...',
        success: 'PHÂN TÍCH THÀNH CÔNG!',
        errorEmpty: 'Vui lòng nhập mô tả công việc',
        errorTooLong: 'Mô tả quá dài (tối đa 500 ký tự)',
        extractedTitle: 'TRÍCH XUẤT THÀNH CÔNG!',
        hint: '💡 AI sẽ tự động trích xuất thông tin tiêu đề, mô tả, ngày giờ, độ ưu tiên từ văn bản của bạn.'
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
      upcomingTitle: 'Sắp đến hạn',
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
      dueSoon: 'Có {count} công việc sắp hết hạn (còn ≤ 24 giờ)',
      upcoming: 'Có {count} công việc sắp đến hạn trong 48 giờ tới'
    },
    notifications: {
      title: 'Thông báo',
      settings: 'Cài đặt',
      newCount: 'Bạn có {count} thông báo chưa đọc',
      moreCount: 'Bạn có {count} thông báo mới:',
      newGeneric: 'Bạn có {count} thông báo mới.',
      dueSoonMessage: 'Bạn có {count} công việc sắp đến hạn',
      overdueMessage: 'Bạn có {count} công việc quá hạn',
      templates: {
        addedToList: 'đã được thêm vào danh sách của bạn',
        emailSent: 'Hệ thống đã gửi email nhắc việc đến hộp thư của bạn',
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
        warning: 'Cảnh báo',
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
        notifyOnDecrease: {
          title: 'Thông báo khi giảm',
          desc: 'Hiện toast nhẹ khi số lượng task giảm (không bật badge)'
        },
        notifyOnZero: {
          title: 'Thông báo khi về 0',
          desc: 'Thông báo khi một nhóm về 0 công việc'
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
        missingFields: 'Vui lòng nhập email và mã xác minh',
        successTitle: 'Thành công!',
        successDesc: 'Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập với mật khẩu mới.',
        backToLogin: 'Quay lại Đăng nhập',
        invalidLink: 'Liên kết đặt lại mật khẩu không hợp lệ.',
        passwordMismatch: 'Mật khẩu xác nhận không khớp!'
      }
    },
    profile: {
      title: 'Hồ sơ',
      subtitle: 'Quản lý tài khoản và bảo mật của bạn',
      sections: {
        info: 'Thông tin',
        security: 'Bảo mật'
      },
      account: {
        title: 'Thông tin tài khoản',
        name: 'Họ tên',
        namePlaceholder: 'Nhập họ tên của bạn',
        email: 'Email',
        emailNote: 'Địa chỉ email không thể thay đổi',
        displayName: 'Tên hiển thị',
        displayHint: 'Tên này sẽ hiển thị với mọi người. Hãy chọn một tên dễ nhận ra.',
        avatar: 'Ảnh đại diện',
        changeAvatar: 'Đổi ảnh đại diện',
        save: 'Lưu thay đổi',
        saving: 'Đang lưu...'
      },
      details: {
        title: 'Chi tiết tài khoản',
        accountType: 'Phương thức đăng nhập',
        local: 'Email/Mật khẩu',
        google: 'Tài khoản Google',
        created: 'Ngày tạo tài khoản',
        securityPrompt: '🔐 Tùy chọn bảo mật',
        supportTitle: '📞 Cần trợ giúp?',
        supportDesc: 'Nếu bạn gặp vấn đề với tài khoản, vui lòng liên hệ đội hỗ trợ của chúng tôi.',
        supportCta: 'Liên hệ hỗ trợ →',
        verified: 'Trạng thái',
        verifiedYes: 'Đã xác minh',
        verifiedNo: 'Chưa xác minh',
        hasPassword: 'Đã có mật khẩu',
        setupPassword: 'Thiết lập mật khẩu'
      },
      security: {
        title: 'Bảo mật',
        setupTitle: 'Thiết lập mật khẩu',
        setupDesc: 'Bạn có thể thiết lập mật khẩu để đăng nhập bằng Email + Password bên cạnh Google.',
        changePassword: 'Đổi mật khẩu',
        currentPassword: 'Mật khẩu hiện tại',
        newPassword: 'Mật khẩu mới',
        confirmPassword: 'Xác nhận mật khẩu mới',
        currentPlaceholder: 'Nhập mật khẩu hiện tại',
        newPlaceholder: 'Nhập mật khẩu mới (tối thiểu 6 ký tự)',
        confirmPlaceholder: 'Nhập lại mật khẩu mới',
        passwordHint: 'Mật khẩu phải có ít nhất 6 ký tự, nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
        submit: 'Cập nhật Mật khẩu',
        updating: 'Đang cập nhật...',
        setPassword: 'Đặt Mật khẩu',
        setting: 'Đang thiết lập...',
        strengthWeak: 'Yếu',
        strengthMedium: 'Trung bình',
        strengthGood: 'Khá',
        strengthStrong: 'Mạnh',
        strengthVeryStrong: 'Rất mạnh'
      }
    }
  },
  en: {
    appName: 'SmartTask',
    nav: {
      dashboard: 'Dashboard',
      tasks: 'Tasks',
      profile: 'Profile',
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
      saving: 'Saving...',
      update: 'Update',
      cancel: 'Cancel',
      close: 'Close',
      back: 'Back',
      loading: 'Loading...',
      created: 'Created at',
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
      confirm: 'Confirm',
      error: 'Something went wrong',
      prev: 'Prev',
      next: 'Next'
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
      warning: 'Warning',
      critical: 'Critical'
    },
    tasks: {
      headerTitle: 'Task List',
      headerSubtitle: 'Manage and track your work progress',
      aiSuggest: 'Sort',
      add: 'Add New',
      filterAll: 'All',
      emptyTitle: 'No tasks yet',
      emptyDesc: 'Empty list. Add a new task or try changing filters.',
      emptyCta: 'Add the first task',
      tabActive: 'Active',
      tabDeleted: 'Archive',
      confirmDeleteTitle: 'Confirm Delete',
      confirmDeleteMessage: 'Are you sure you want to delete "{title}"? The task will be shifted to the archive for {days} days before permanent deletion.',
      emptyState: {
        archiveTitle: 'ARCHIVE_EMPTY: NO DATA',
        archiveMessage: 'NO ARCHIVED DATA DETECTED IN THE TEMPORARY STORAGE OVER THE PAST 30 DAYS.',
        systemTitle: 'SYSTEM_LOG: EMPTY',
        systemMessageEmpty: 'NO INITIALIZED DATA DETECTED. START BY CREATING A NEW TASK.',
        systemMessageFiltered: 'NO MATCHING DATA DETECTED FOR CURRENT FILTERS.'
      },
      formTitleCreate: 'Add new task',
      formTitleEdit: 'Edit task',
      detailTitle: 'Task Details',
      editTitle: 'Edit Task',
      form: {
        title: 'Title',
        titlePlaceholder: 'Example: Finish the report...',
        deadline: 'Deadline',
        time: 'Time',
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
      success: {
        updated: 'Task updated successfully!'
      },
      errors: {
        titleRequired: 'Please enter task title',
        deadlineRequired: 'Please select deadline',
        updateFailed: 'Unable to update task. Please try again.'
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
        revertNotice: 'Cannot update because the task is temporarily deleted.',
        restoreError: 'Restore failed. Please try again.',
        restored: 'Task restored successfully.',
        aiError: 'AI request failed. Please try again later.'
      },
      aiInput: {
        title: 'QUICK CREATE WITH AI PILOT',
        placeholder: 'Example: "Next Monday at 9am project group meeting, high priority"',
        submit: 'PARSE WITH AI',
        parsing: 'PARSING...',
        success: 'PARSED SUCCESSFULLY!',
        errorEmpty: 'Please enter task description',
        errorTooLong: 'Description too long (max 500 characters)',
        extractedTitle: 'EXTRACTION SUCCESSFUL!',
        hint: '💡 AI will automatically extract task title, description, date, time, and priority from your text.'
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
      upcomingTitle: 'Due soon',
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
      dueSoonMessage: 'You have {count} tasks due soon',
      overdueMessage: 'You have {count} tasks that are overdue',
      templates: {
        addedToList: 'has been added to your list',
        emailSent: 'System has sent task reminders to your email',
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
        warning: 'Warning',
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
        notifyOnDecrease: {
          title: 'Notify on decrease',
          desc: 'Show light toast when task count decreases (no badge)'
        },
        notifyOnZero: {
          title: 'Notify on zero',
          desc: 'Notify when a group reaches 0 tasks'
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
        missingFields: 'Please enter email and verification code',
        successTitle: 'Success!',
        successDesc: 'Your password has been updated. You can now sign in with it.',
        backToLogin: 'Back to Login',
        invalidLink: 'Reset password link is invalid.',
        passwordMismatch: 'Passwords do not match!'
      }
    },
    profile: {
      title: 'Profile',
      sections: {
        info: 'Information',
        security: 'Security'
      },
      account: {
        title: 'Account Information',
        name: 'Full name',
        namePlaceholder: 'Your full name',
        email: 'Email',
        displayName: 'Display name',
        displayHint: 'This name is shown to others. Pick something recognizable.',
        avatar: 'Avatar',
        changeAvatar: 'Change avatar',
        save: 'Save Changes',
        saving: 'Saving...'
      },
      details: {
        title: 'Account Details',
        accountType: 'Sign-in method',
        local: 'Email/Password',
        google: 'Google account',
        created: 'Account created',
        securityPrompt: '🔐 Security option',
        supportTitle: '📞 Need help?',
        supportDesc: 'If you have any issues with your account, please contact our support team.',
        supportCta: 'Contact support →',
        verified: 'Status',
        verifiedYes: 'Verified',
        verifiedNo: 'Not verified',
        hasPassword: 'Has password',
        setupPassword: 'Setup password'
      },
      subtitle: 'Manage your account and security',
      security: {
        title: 'Security',
        setupTitle: 'Setup password',
        setupDesc: 'You can set up a password to sign in with Email + Password besides Google.',
        changePassword: 'Change password',
        currentPassword: 'Current password',
        newPassword: 'New password',
        confirmPassword: 'Confirm new password',
        currentPlaceholder: 'Enter current password',
        newPlaceholder: 'Enter new password (min 6 chars)',
        confirmPlaceholder: 'Re-enter new password',
        passwordHint: 'Password must be at least 6 characters, should include uppercase, lowercase, numbers and special characters',
        submit: 'Update Password',
        updating: 'Updating...',
        setPassword: 'Set Password',
        setting: 'Setting...',
        strengthWeak: 'Weak',
        strengthMedium: 'Medium',
        strengthGood: 'Good',
        strengthStrong: 'Strong',
        strengthVeryStrong: 'Very Strong'
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
