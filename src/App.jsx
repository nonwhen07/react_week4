import { useState, useEffect, useRef } from "react";
import { Modal } from "bootstrap";
import axios from "axios";

function App() {
  // 環境變數
  const baseURL = import.meta.env.VITE_BASE_URL;
  const apiPath = import.meta.env.VITE_API_PATH;

  // Modal Ref 定義
  const productModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  // 狀態管理 (State)
  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  //Modal 資料狀態的預設值
  const defaultModalState = {
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    origin_price: "",
    price: "",
    description: "",
    content: "",
    is_enabled: 0,
    imagesUrl: [""],
  };
  const [tempProduct, setTempProduct] = useState(defaultModalState);
  const [modalMode, setModalMode] = useState(null);

  // API & 認證相關函式
  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post(`${baseURL}/v2/admin/signin`, account)
      .then((res) => {
        const { token, expired } = res.data;
        document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
        axios.defaults.headers.common["Authorization"] = token;
        getProducts();
        setIsAuth(true); // 設定登入狀態
      })
      .catch((err) => {
        setIsAuth(false);
        console.error(err);
        alert("登入失敗");
      });
  };
  // 表單變更事件
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccount((prev) => ({ ...prev, [name]: value }));
  };
  // 取得產品列表
  const getProducts = () => {
    axios
      .get(`${baseURL}/v2/api/${apiPath}/admin/products`)
      .then((res) => {
        setProducts(res.data.products);
      })
      .catch((err) => {
        console.error(err);
        alert("取得產品列表失敗");
      });
  };
  //確認登入狀態
  const checkLogin = () => {
    axios
      .post(`${baseURL}/v2/api/user/check`)
      .then(() => {
        setIsAuth(true);
        getProducts();
      })
      .catch((error) => {
        console.error(error);
        setIsAuth(false);
      });
  };

  // Modal表單-變更事件
  const handleModalInputChange = (e) => {
    // Modal 表單變更事件
    const { name, value, checked, type } = e.target;
    setTempProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, //透過type判斷是否為checkbox，綁定 checkbox 的勾選狀態時，應透過 checked 屬性，而非 value
    }));
  };
  const handleImageChange = (e, index) => {
    // 副圖表單變更事件
    const { value } = e.target;
    const newImageUrl = [...tempProduct.imagesUrl]; // 複製一份原本的副圖陣列
    newImageUrl[index] = value; // 找出要修改的陣列index，進行修改
    setTempProduct((prev) => ({
      ...prev,
      imagesUrl: newImageUrl,
    }));
  };
  // Modal表單 - 新增、刪除副圖
  const handleAddImage = () => {
    const newImagesUrl = [...tempProduct.imagesUrl, ""]; // 複製一份原本的副圖陣列
    setTempProduct((prev) => ({
      ...prev,
      imagesUrl: newImagesUrl,
    }));
  };
  const handleDeleteImage = () => {
    const newImagesUrl = [...tempProduct.imagesUrl]; // 複製一份原本的副圖陣列
    newImagesUrl.pop(); // 移除最後一筆
    setTempProduct((prev) => ({
      ...prev,
      imagesUrl: newImagesUrl,
    }));
  };

  // 新增、編輯、刪除產品動點
  const handleUpdateProduct = async () => {
    try {
      await (modalMode === "create" ? createProduct() : updateProduct());
      getProducts();
      handleCloseProductModal();
    } catch (err) {
      console.error(err);
      alert("更新失敗");
    }
  };
  // 新增
  const createProduct = async () => {
    try {
      await axios.post(
        `${baseURL}/v2/api/${apiPath}/admin/product`,
        tempProduct
      );
    } catch (error) {
      console.error(error);
      alert("新增商品失敗");
    }
  };
  // 編輯
  const updateProduct = async () => {
    try {
      await axios.post(`${baseURL}/v2/api/${apiPath}/admin/product`, {
        ...tempProduct,
        origin_price: Number(tempProduct.origin_price),
        price: Number(tempProduct.price),
        is_enabled: tempProduct.is_enabled ? 1 : 0,
      });
    } catch (error) {
      console.error(error);
      alert("編輯商品失敗");
    }
  };
  // 刪除產品動點
  const handleDeleteProduct = async () => {
    try {
      await deleteProduct();
      getProducts();
      handleCloseDeleteModal();
    } catch (error) {
      console.error(error);
      alert("刪除商品失敗");
    }
  };
  // 刪除
  const deleteProduct = async () => {
    try {
      await axios.delete(
        `${baseURL}/v2/api/${apiPath}/admin/product/${tempProduct.id}`
      );
    } catch (error) {
      console.error(error);
      alert("刪除商品失敗");
    }
  };

  // Modal 控制
  // ProductModal
  const handleOpenProductModal = (mode, product = defaultModalState) => {
    // switch (mode) {
    //   case 'create':
    //     setTempProduct(defaultModalState);
    //     break;
    //   case 'edit':
    //     setTempProduct(product || defaultModalState);
    //     break;
    //   default:
    //     break;
    // }
    // setTempProduct(product || defaultModalState); // 簡化switch，新增就使用預設值defaultModalState處理
    setModalMode(mode);
    setTempProduct(
      Object.keys(product).length > 0 ? product : defaultModalState // 避免 api 回傳 product 為空物件時，無法正確設定tempProduct更保險
    );
    Modal.getInstance(productModalRef.current).show(); // Modal.getInstance 取得 Modal 實例，再使用 show() 顯示 Modal
  };
  const handleCloseProductModal = () => {
    // const modalInstance = Modal.getInstance(productModalRef.current); // productModalRef.current 取得 useRef 的 DOM
    // modalInstance.hide();
    Modal.getInstance(productModalRef.current).hide();
  };
  // DeleteModal
  const handleOpenDeleteModal = (product = defaultModalState) => {
    setTempProduct(
      // 避免 api 回傳 product 為空物件時，無法正確設定tempProduct更保險
      product && Object.keys(product).length > 0 ? product : defaultModalState
    );
    Modal.getInstance(deleteModalRef.current).show();
  };
  const handleCloseDeleteModal = () => {
    Modal.getInstance(deleteModalRef.current).hide();
  };

  // useEffect
  useEffect(() => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common["Authorization"] = token;
    checkLogin();
  }, []);
  //初始化 Modal
  useEffect(() => {
    if (productModalRef.current) {
      new Modal(productModalRef.current, { backdrop: false });
    }
    if (deleteModalRef.current) {
      new Modal(deleteModalRef.current, { backdrop: false });
    }
  }, [productModalRef, deleteModalRef]);

  return (
    <>
      {isAuth ? (
        <div className="container py-5">
          <div className="d-flex justify-content-between">
            <h2>產品列表</h2>
            <button
              type="button"
              onClick={() => {
                handleOpenProductModal("create");
              }}
              className="btn btn-primary"
            >
              新增產品
            </button>
          </div>
          <table className="table mt-4">
            <thead>
              <tr>
                <th scope="col-3">產品名稱</th>
                <th scope="col-2">原價</th>
                <th scope="col-2">售價</th>
                <th scope="col-2">是否啟用</th>
                <th scope="col-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th scope="row">{product.title}</th>
                  <td>{product.origin_price}</td>
                  <td>{product.price}</td>
                  <td>
                    {product.is_enabled ? (
                      <span className="text-success">啟用</span>
                    ) : (
                      <span>未啟用</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleOpenProductModal("edit", product)}
                      className="btn btn-sm btn-outline-primary"
                      type="button"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(product)}
                      className="btn btn-sm btn-outline-danger"
                      type="button"
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
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
      )}

      <div
        id="productModal"
        ref={productModalRef}
        className="modal"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">
                {modalMode === "create"
                  ? "新增產品"
                  : "編輯 - " + tempProduct.title}
              </h5>
              <button
                type="button"
                onClick={handleCloseProductModal}
                className="btn-close"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    <img src="" alt="" className="img-fluid" />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          id={`imagesUrl-${index + 1}`}
                          value={image}
                          onChange={(e) => {
                            handleImageChange(e, index);
                          }}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="btn-group w-100">
                    {tempProduct.imagesUrl.length < 5 &&
                      tempProduct.imagesUrl[
                        tempProduct.imagesUrl.length - 1
                      ] !== "" && (
                        <button
                          onClick={handleAddImage}
                          className="btn btn-outline-primary btn-sm w-100"
                        >
                          新增圖片
                        </button>
                      )}
                    {tempProduct.imagesUrl.length > 1 && (
                      <button
                        onClick={handleDeleteImage}
                        className="btn btn-outline-danger btn-sm w-100"
                      >
                        刪除圖片
                      </button>
                    )}
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={tempProduct.title}
                      onChange={handleModalInputChange}
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value={tempProduct.category}
                      onChange={handleModalInputChange}
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={tempProduct.unit}
                      onChange={handleModalInputChange}
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={tempProduct.origin_price}
                        onChange={handleModalInputChange}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={tempProduct.price}
                        onChange={handleModalInputChange}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={tempProduct.description}
                      onChange={handleModalInputChange}
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={tempProduct.content}
                      onChange={handleModalInputChange}
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={Boolean(tempProduct.is_enabled)}
                      onChange={handleModalInputChange}
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button
                type="button"
                onClick={handleCloseProductModal}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleUpdateProduct}
                className="btn btn-primary"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        id="delProductModal"
        ref={deleteModalRef}
        className="modal fade"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="btn btn-danger"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
