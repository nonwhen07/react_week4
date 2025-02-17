import { useState, useEffect, useRef } from "react";
import { Modal } from "bootstrap";
import axios from "axios";
// import PropTypes from 'prop-types';
import Pagination from '../components/Pagination';
import ProductModal from '../components/ProductModal';

function ProductPage() {
  // 環境變數
  const baseURL = import.meta.env.VITE_BASE_URL;
  const apiPath = import.meta.env.VITE_API_PATH;
  // Modal Ref 定義
  const deleteModalRef = useRef(null);
  // 狀態管理 (State)
  const [products, setProducts] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  // 管理Modal元件開關
  const [ isProductModalOpen, setIsProductModalOpen ] = useState(false);
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
    Modal.getInstance(deleteModalRef.current).show();
  };
  const handleCloseDeleteModal = () => {
    Modal.getInstance(deleteModalRef.current).hide();
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

  //ProductPage 初始化呼叫 getProducts
  useEffect(() =>{
    getProducts()
  }, [])

  //初始化 Modal
  useEffect(() => {
    if (deleteModalRef.current) {
      new Modal(deleteModalRef.current, { backdrop: false });
    }
  }, [deleteModalRef]);

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
      
      {/* <DeleteModal modalMode={modalMode} tempProduct={tempProduct} isOpen={isdeleteModalOpen} setIsOpen={setIsDeleteModalOpen}   /> */}

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
  )
}

export default ProductPage;
