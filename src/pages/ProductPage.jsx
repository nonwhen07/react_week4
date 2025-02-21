import { useState, useEffect } from "react";
// import { Modal } from "bootstrap";
import axios from "axios";
// import PropTypes from 'prop-types';
import Pagination from '../components/Pagination';
import ProductModal from '../components/ProductModal';
import DeleteModal from '../components/DeleteModal';

function ProductPage() {
  // 環境變數
  const baseURL = import.meta.env.VITE_BASE_URL;
  const apiPath = import.meta.env.VITE_API_PATH;
  // Modal Ref 定義
  // const deleteModalRef = useRef(null);
  // 狀態管理 (State)
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  // 管理Modal元件開關
  const [ isProductModalOpen, setIsProductModalOpen ] = useState(false);
  const [ isDeleteModalOpen, setIsDeleteModalOpen ] = useState(false);

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

  // 取得產品列表
  const getProducts = async (page) => {
    try {
      const res = await axios.get(
        `${baseURL}/v2/api/${apiPath}/admin/products?page=${page}`
      );
      setProducts(res.data.products);
      setPageInfo(res.data.pagination);
    } catch (error) {
      console.error(error);
      alert("取得產品列表失敗");
    }
  };

  // 產品列表分頁
  const handlePageChange = (page = 1) => {
    getProducts(page);
  };
  
  // Modal 開關控制
  // ProductModal
  const handleOpenProductModal = (mode, product = defaultModalState) => {
    setModalMode(mode);
    setTempProduct(
      Object.keys(product).length > 0 ? product : defaultModalState // 避免 api 回傳 product 為空物件時，無法正確設定tempProduct更保險
    );
    // 由於元件化了所以直接setIsProductModalOpen(true)，通知 ProductModal 打開
    setIsProductModalOpen(true)
  };
  // DeleteModal
  const handleOpenDeleteModal = (product = defaultModalState) => {
    setTempProduct(
      // 避免 api 回傳 product 為空物件時，無法正確設定tempProduct更保險
      product && Object.keys(product).length > 0 ? product : defaultModalState
    );
    // Modal.getInstance(deleteModalRef.current).show();
    setIsDeleteModalOpen(true)
  };
  
  //ProductPage 初始化呼叫 getProducts
  useEffect(() =>{
    getProducts()
  }, [])

  return (
    <>
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
        <Pagination pageInfo={pageInfo} handlePageChange={handlePageChange} />
      </div>

      <ProductModal 
        modalMode={modalMode} 
        tempProduct={tempProduct} 
        getProducts={getProducts}
        isOpen={isProductModalOpen} 
        setIsOpen={setIsProductModalOpen} 
      />
      
      <DeleteModal 
        tempProduct={tempProduct} 
        getProducts={getProducts}
        isOpen={isDeleteModalOpen} 
        setIsOpen={setIsDeleteModalOpen}   
        />

      
      
    </>
  )
}

export default ProductPage;
