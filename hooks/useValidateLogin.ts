import { useState, useEffect } from 'react';

export function useValidateLogin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateLogin = async () => {
      try {
        const response = await fetch('/api/validate-login');
        const data = await response.json();

        if (data.authenticated) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Failed to validate login:", error);
      } finally {
        setLoading(false);
      }
    };

    validateLogin();
  }, []);

  return { isLoggedIn, loading };
}
