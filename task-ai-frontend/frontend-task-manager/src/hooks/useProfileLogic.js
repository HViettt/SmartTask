import { useState, useCallback } from 'react';
import api from '../services/api';
import { useAuthStore } from '../features/useStore';
import { showToast } from '../utils/toastUtils';

export const useProfileLogic = () => {
  const updateUserInfo = useAuthStore((state) => state.updateUserInfo);

  // ===== PROFILE STATE =====
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: '',
    isGoogleUser: false,
    hasPassword: false,
    createdAt: null,
    isVerified: false,
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ===== PASSWORD STATE =====
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  // ===== AVATAR VALIDATION =====
  const validateAvatarFile = (file) => {
    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      showToast.error('Vui lòng chọn file ảnh (JPG, PNG, WebP)');
      return false;
    }

    // Kiểm tra kích thước (10MB max - sẽ compress sau)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast.error('Kích thước ảnh không được vượt quá 10MB');
      return false;
    }

    return true;
  };

  // ===== COMPRESS & RESIZE IMAGE =====
  const compressAndResizeImage = (file, maxWidth = 400, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // Create canvas
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize to maxWidth while maintaining aspect ratio
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // ===== FETCH PROFILE =====
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const response = await api.get('/user/profile');
      const { data } = response.data;

      setProfileData({
        name: data.name || '',
        email: data.email || '',
        avatar: data.avatar || '',
        isGoogleUser: data.isGoogleUser || false,
        hasPassword: data.hasPassword || false,
        createdAt: data.createdAt || null,
        isVerified: data.isVerified || false,
      });

      setAvatarPreview(data.avatar || '');
      return data;
    } catch (error) {
      console.error('Fetch profile error:', error);
      throw error;
    }
  }, []);

  // ===== HANDLE AVATAR CHANGE =====
  const handleAvatarChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!validateAvatarFile(file)) return;

    try {
      // Compress and resize image
      showToast.info('Đang xử lý ảnh...');
      const compressedBase64 = await compressAndResizeImage(file, 400, 0.85);
      
      setAvatarFile(file);
      setAvatarPreview(compressedBase64);
    } catch (error) {
      console.error('Image compression error:', error);
      showToast.error('Không thể xử lý ảnh');
    }
  }, []);

  // ===== HANDLE UPDATE PROFILE =====
  const handleUpdateProfile = useCallback(
    async (e) => {
      e.preventDefault();

      // Validation
      if (!profileData.name.trim()) {
        showToast.error('Tên hiển thị không được để trống');
        return;
      }

      try {
        setIsSavingProfile(true);

        // Chuẩn bị dữ liệu
        let avatarUrl = profileData.avatar;
        if (avatarFile) {
          // Nếu có avatar mới, sử dụng base64 (hoặc upload to Cloudinary)
          avatarUrl = avatarPreview;
        }

        // Gửi request
        const response = await api.put('/user/profile', {
          name: profileData.name.trim(),
          avatar: avatarUrl,
        });

        if (response.data.success) {
          // Update global state
          updateUserInfo(response.data.data);

          // Reset state
          setAvatarFile(null);

          showToast.success('Cập nhật profile thành công!');
        }
      } catch (error) {
        console.error('Update profile error:', error);
        const errorMsg =
          error.response?.data?.message || 'Không thể cập nhật hồ sơ';
        showToast.error(errorMsg);
      } finally {
        setIsSavingProfile(false);
      }
    },
    [profileData, avatarFile, avatarPreview, updateUserInfo]
  );

  // ===== VALIDATE PASSWORD =====
  const validatePassword = (password) => {
    if (!password || password.length < 6) {
      showToast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  // ===== HANDLE CHANGE PASSWORD (Email/Password Users) =====
  const handleChangePassword = useCallback(
    async (e) => {
      e.preventDefault();

      const { currentPassword, newPassword, confirmPassword } = passwordData;

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        showToast.error('Vui lòng điền đầy đủ tất cả các trường');
        return;
      }

      if (!validatePassword(newPassword)) return;

      if (newPassword !== confirmPassword) {
        showToast.error('❌ Mật khẩu mới và xác nhận không khớp');
        return;
      }

      if (currentPassword === newPassword) {
        showToast.error('Mật khẩu mới phải khác mật khẩu hiện tại');
        return;
      }

      try {
        setIsChangingPassword(true);

        const response = await api.put('/user/change-password', {
          currentPassword,
          newPassword,
          confirmPassword,
        });

        if (response.data.success) {
          // Reset form
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });

          showToast.success('Đổi mật khẩu thành công!');
        }
      } catch (error) {
        console.error('Change password error:', error);
        const errorMsg =
          error.response?.data?.message || 'Không thể đổi mật khẩu';
        showToast.error(errorMsg);
        // Không throw error để tránh redirect ra login
      } finally {
        setIsChangingPassword(false);
      }
    },
    [passwordData]
  );

  // ===== HANDLE SET PASSWORD (Google Users) =====
  const handleSetPassword = useCallback(
    async (e) => {
      e.preventDefault();

      const { newPassword, confirmPassword } = passwordData;

      // Validation
      if (!newPassword || !confirmPassword) {
        showToast.error('Vui lòng điền đầy đủ tất cả các trường');
        return;
      }

      if (!validatePassword(newPassword)) return;

      if (newPassword !== confirmPassword) {
        showToast.error('Mật khẩu mới và xác nhận không khớp');
        return;
      }

      try {
        setIsSettingPassword(true);

        // API endpoint: POST /api/user/set-password
        const response = await api.post('/user/set-password', {
          newPassword,
          confirmPassword,
        });

        if (response.data.success) {
          // Reset form
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });

          // Update profile data (không còn là Google-only account)
          setProfileData((prev) => ({
            ...prev,
            isGoogleUser: true, // Vẫn là Google user nhưng giờ có password
          }));

          showToast.success(
            'Thiết lập mật khẩu thành công! Bạn giờ có thể đăng nhập bằng Email + Password'
          );
        }
      } catch (error) {
        console.error('Set password error:', error);
        const errorMsg =
          error.response?.data?.message || 'Không thể thiết lập mật khẩu';
        showToast.error(errorMsg);
      } finally {
        setIsSettingPassword(false);
      }
    },
    [passwordData]
  );

  // ===== RETURN HOOK INTERFACE =====
  return {
    // Profile data
    profileData,
    setProfileData,
    avatarPreview,
    isSavingProfile,

    // Password data
    passwordData,
    setPasswordData,
    showPasswords,
    setShowPasswords,
    isChangingPassword,
    isSettingPassword,

    // Methods
    fetchProfile,
    handleAvatarChange,
    handleUpdateProfile,
    handleChangePassword,
    handleSetPassword,
  };
};
