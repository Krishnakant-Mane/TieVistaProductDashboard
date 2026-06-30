import { useState, useEffect } from "react";
import Login from "./Components/Login";
import ProductManager from "./Components/ProductManager";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

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
