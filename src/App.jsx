// import { useState, useEffect, useRef } from "react";
import { useState } from "react";
// import { Modal } from "bootstrap";
//import axios from "axios";
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";

function App() {
  // 環境變數
  // const baseURL = import.meta.env.VITE_BASE_URL;
  // const apiPath = import.meta.env.VITE_API_PATH;

  // 狀態管理 (State)
  const [isAuth, setIsAuth] = useState(false);

  return <>{isAuth ? <ProductPage /> : <LoginPage setIsAuth={setIsAuth} />}</>;
}

export default App;
