import { useState, useEffect } from "react";
import Login from "./Components/Login";
import ProductManager from "./Components/ProductManager";

const getValidToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return token;
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
};

function App() {
  const [token, setToken] = useState(getValidToken());

  useEffect(() => {
    const checkTokenValidity = () => {
      const validToken = getValidToken();
      if (!validToken && token) {
        setToken(null);
      }
    };

    // Check every minute if the token has expired
    const interval = setInterval(checkTokenValidity, 60000);

    // Also check on window focus
    window.addEventListener('focus', checkTokenValidity);
    
    // Check across tabs if user logs out or token expires
    window.addEventListener('storage', checkTokenValidity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkTokenValidity);
      window.removeEventListener('storage', checkTokenValidity);
    };
  }, [token]);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return <ProductManager token={token} onLogout={handleLogout} />;
}

export default App;
