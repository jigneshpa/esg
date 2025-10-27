declare global {
  interface Window {
    inactivityTimeout: ReturnType<typeof setTimeout>;
  }
}

import { useEffect } from 'react';

const MAX_INACTIVE_TIME_IN_MILLI_SECONDS = 3 * 60 * 60 * 1000;

const useInactivityLogout = (logoutFunction: () => void) => {
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    const resetTimer = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
      clearTimeout(window.inactivityTimeout);
      window.inactivityTimeout = setTimeout(checkInactivity, MAX_INACTIVE_TIME_IN_MILLI_SECONDS);
    };

    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (lastActivity && Date.now() - parseInt(lastActivity, 10) >= MAX_INACTIVE_TIME_IN_MILLI_SECONDS) {
        logoutFunction();
      } else {
        resetTimer();
      }
    };

    checkInactivity();
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(window.inactivityTimeout);
    };
  }, []);
};

export default useInactivityLogout;
