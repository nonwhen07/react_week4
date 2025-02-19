import { useState, useEffect, useRef } from "react";
import { Modal } from "bootstrap";
import axios from "axios";
import PropTypes from 'prop-types';

function ProductModal ({modalMode, tempProduct, getProducts, isOpen, setIsOpen }) {
  // 環境變數
  const baseURL = import.meta.env.VITE_BASE_URL;
  const apiPath = import.meta.env.VITE_API_PATH;

  //拷貝 tempProduct 資料來轉換成 modalData來顯示
  const [modalData, setModalData] = useState(tempProduct);
  // Modal Ref 定義
  const productModalRef = useRef(null); 

  // Modal表單-變更事件
  const handleModalInputChange = (e) => {
    // Modal 表單變更事件
    const { name, value, checked, type } = e.target;
    setModalData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, //透過type判斷是否為checkbox，綁定 checkbox 的勾選狀態時，應透過 checked 屬性，而非 value
    }));
  };
  const handleImageChange = (e, index) => {
    // 副圖表單變更事件
    const { value } = e.target;
    const newImageUrl = [...modalData.imagesUrl]; // 複製一份原本的副圖陣列
    newImageUrl[index] = value; // 找出要修改的陣列index，進行修改
    setModalData((prev) => ({
      ...prev,
      imagesUrl: newImageUrl,
    }));
  };
  // Modal表單 - 新增、刪除副圖
  const handleAddImage = () => {
    const newImagesUrl = [...modalData.imagesUrl, ""]; // 複製一份原本的副圖陣列
    setModalData((prev) => ({
      ...prev,
      imagesUrl: newImagesUrl,
    }));
  };
  const handleDeleteImage = () => {
    const newImagesUrl = [...modalData.imagesUrl]; // 複製一份原本的副圖陣列
    newImagesUrl.pop(); // 移除最後一筆
    setModalData((prev) => ({
      ...prev,
      imagesUrl: newImagesUrl,
    }));
  };
  // Modal表單 - 主圖上傳
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData(); // 先確認後端api接收檔案時，所使用 FormData 格式。 enctype="multipart/form-data"
    formData.append("file-to-upload", file); // file-to-upload 也是先確認後端api接收檔案的 key
    try {
      const res = await axios.post(
        `${baseURL}/v2/api/${apiPath}/admin/upload`,
        formData
      );
      const imgUploadUrl = res.data.imageUrl;
      console.log(imgUploadUrl);
      setModalData((prev) => ({
        ...prev,
        imageUrl: imgUploadUrl,
      }));
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  // 新增、編輯、刪除產品動點
  const handleUpdateProduct = async () => {
    const apiCall = modalMode === "create" ? createProduct : updateProduct;
    try {
      await apiCall();
      getProducts(); // 更新完畢後，驅動外部頁面重新查詢資料
      handleCloseProductModal();
    } catch (error) {
      console.error(error);
      alert("更新產品失敗");
    }
  };
  // 新增
  const createProduct = async () => {
    try {
      await axios.post(`${baseURL}/v2/api/${apiPath}/admin/product`, {
        data: {
          ...modalData,
          origin_price: Number(modalData.origin_price),
          price: Number(modalData.price),
          is_enabled: modalData.is_enabled ? 1 : 0,
        },
      });
    } catch (error) {
      console.error(error);
      alert("新增產品失敗");
    }
  };
  // 編輯
  const updateProduct = async () => {
    try {
      await axios.put(
        `${baseURL}/v2/api/${apiPath}/admin/product/${modalData.id}`,
        {
          data: {
            ...modalData,
            origin_price: Number(modalData.origin_price),
            price: Number(modalData.price),
            is_enabled: modalData.is_enabled ? 1 : 0,
          },
        }
      );
    } catch (error) {
      console.error(error);
      alert("編輯產品失敗");
    }
  };

  // Modal 開關控制
  const handleCloseProductModal = () => {
    setIsOpen(false);
  };
  
  //初始化 Modal
  useEffect(() => {
    if (productModalRef.current) {
      new Modal(productModalRef.current, { backdrop: false });
    }
  }, []);

  // Modal 開關控制
  // 使用useEffect來監視isOpen的更新狀態，變動來開啟ProductModal
  // useEffect(() => {
  //   if (isOpen) {
  //     Modal.getInstance(productModalRef.current).show();
  //   }
  // }, [isOpen]);
  // const handleCloseProductModal = () => {
  //   Modal.getInstance(productModalRef.current).hide();
  //   // 並在關閉時設定 isOpen狀態
  //   setIsOpen(false)
  // };
  useEffect(() => { // 集中處理開關 由 isOpen 判斷
    if (isOpen && productModalRef.current) {
      new Modal(productModalRef.current, { backdrop: false }).show();
    } else if (!isOpen && productModalRef.current) {
      const modalInstance = Modal.getInstance(productModalRef.current);
      if (modalInstance) modalInstance.hide();
    }
  }, [isOpen]);

  // 當外部 tempProduct 有異動時，更新modalData
  useEffect(() => {
    setModalData({
      ...tempProduct || {
        imageUrl: "",
        title: "",
        category: "",
        unit: "",
        origin_price: 0,
        price: 0,
        description: "",
        content: "",
        is_enabled: 0,
        imagesUrl: [""]
      }
    })
  }, [tempProduct]);

  return (
    <div
      id="productModal"
      ref={productModalRef}
      className="modal"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      inert={!isOpen}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fs-4">
              {modalMode === "create"
                ? "新增產品"
                : "編輯 - " + modalData.title}
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
                <div className="mb-5">
                  <label htmlFor="fileInput" className="form-label">
                    {" "}
                    圖片上傳 僅限使用 jpg、jpeg 與 png 格式，檔案大小限制為
                    3MB 以下。
                  </label>
                  <input
                    onChange={handleFileChange}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="form-control"
                    id="fileInput"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="primary-image" className="form-label">
                    主圖
                  </label>
                  <div className="input-group">
                    <input
                      value={modalData.imageUrl}
                      onChange={handleModalInputChange}
                      name="imageUrl"
                      type="text"
                      id="primary-image"
                      className="form-control"
                      placeholder="請輸入圖片連結"
                    />
                  </div>
                  <img
                    src={modalData.imageUrl || null}
                    alt=""
                    className="img-fluid"
                  />
                </div>

                {/* 副圖 */}
                <div className="border border-2 border-dashed rounded-3 p-3">
                  {modalData.imagesUrl?.map((image, index) => (
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
                          src={image || null}
                          alt={`副圖 ${index + 1}`}
                          className="img-fluid mb-2"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="btn-group w-100">
                  {modalData.imagesUrl.length < 5 &&
                    modalData.imagesUrl[
                      modalData.imagesUrl.length - 1
                    ] !== "" && (
                      <button
                        onClick={handleAddImage}
                        className="btn btn-outline-primary btn-sm w-100"
                      >
                        新增圖片
                      </button>
                    )}
                  {modalData.imagesUrl.length > 1 && (
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
                    value={modalData.title}
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
                    value={modalData.category}
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
                    value={modalData.unit}
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
                      value={modalData.origin_price}
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
                      value={modalData.price}
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
                    value={modalData.description}
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
                    value={modalData.content}
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
                    checked={Boolean(modalData.is_enabled)}
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
              onClick={handleUpdateProduct}
              className="btn btn-primary"
            >
              確認
            </button>
            <button
              type="button"
              onClick={handleCloseProductModal}
              className="btn btn-secondary"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// === 新增 `propTypes` 驗證 ===
ProductModal.propTypes = {
  modalMode: PropTypes.string.isRequired,
  tempProduct: PropTypes.shape({ // 確保 `tempProduct` 是物件，且內部特定屬性為必填
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    origin_price: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    is_enabled: PropTypes.number.isRequired,
    imagesUrl: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,

  getProducts: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired
};

ProductModal.defaultProps = {
  tempProduct: {
    is_enabled: 0, // 確保未設定時預設為 0（未啟用）
  }
};

export default ProductModal;