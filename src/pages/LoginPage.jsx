import { useState } from "react";
import axios from "axios";
import PropTypes from 'prop-types';

function LoginPage({ getProducts, setIsAuth }) {//{ getProducts, setIsAuth } 為主頁面傳入LoginPage元件的參數或方法
    // 環境變數
  const baseURL = import.meta.env.VITE_BASE_URL;

  // 狀態管理 (State)
  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example",
  });

  // API & 認證相關函式
  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post(`${baseURL}/v2/admin/signin`, account)
      .then((res) => {
        const { token, expired } = res.data;
        document.cookie = `hexToken4=${token}; expires=${new Date(expired)}`;
        axios.defaults.headers.common["Authorization"] = token;
        getProducts();
        setIsAuth(true); // 設定登入狀態
      })
      .catch((error) => {
        setIsAuth(false);
        console.error(error);
        alert("登入失敗");
      });
  };
  // 表單變更事件
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };

  return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div className="form-floating mb-3">
              <input
                id="username"
                name="username"
                type="email"
                value={account.username || ""}
                onChange={handleInputChange}
                className="form-control"
                placeholder="example@test.com"
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                id="password"
                name="password"
                type="password"
                value={account.password || ""}
                onChange={handleInputChange}
                className="form-control"
                placeholder="example"
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary">
              登入
            </button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )
}

// === 新增 `propTypes` 驗證 ===
LoginPage.propTypes = {
  getProducts: PropTypes.func.isRequired, // 確保 `getProducts` 是函式
  setIsAuth: PropTypes.func.isRequired,   // 確保 `setIsAuth` 是函式
};

export default LoginPage;