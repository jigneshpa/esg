import { useNavigate } from 'react-router-dom';

import { URLS } from '@/constants';
import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/user/userSlice';

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      dispatch(clearUser());

      // Don't clear everything as it might interfere with Redux persist
      sessionStorage.clear();
      localStorage.clear();
      // clear all cookies
      document.cookie.split(';').forEach(function (c) {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      // Use React Router navigation instead of window.location to prevent full page reload
      navigate(URLS.LOG_IN, { replace: true });
      return true;
    } catch (error) {
      /*notify({
        type: STATUS.ERROR,
        message: error?.response?.data?.message || MESSAGE.LOG_OUT_FAIL
      });*/
      console.error('Logout error:', error);
      return false;
    }
  };

  return handleLogout;
};
