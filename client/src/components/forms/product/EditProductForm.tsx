import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Products as ProductInterface } from "../../../interfaces/Products";
import ProductService from "../../../services/ProductService";
import ErrorHandler from "../../../handler/ErrorHandler";

interface EditProductFormProps {
  product: ProductInterface;
  setSubmitForm: React.MutableRefObject<(() => void) | null>;
  setLoadingUpdate: (loading: boolean) => void;
  onProductUpdated: (message: string) => void;
}

interface ProductFieldErrors {
  name?: string[];
  description?: string[];
  price?: string[];
  stock_quantity?: string[];
  alert_threshold?: string[];
  sku?: string[];
  barcode?: string[];
  category?: string[];
  active?: string[];
}

const EditProductForm = ({
  product,
  setSubmitForm,
  setLoadingUpdate,
  onProductUpdated,
}: EditProductFormProps) => {
  const [state, setState] = useState({
    name: product.name,
    description: product.description || "",
    price: product.price.toString(),
    stock_quantity: product.stock_quantity.toString(),
    alert_threshold: product.alert_threshold.toString(),
    sku: product.sku,
    barcode: product.barcode || "",
    category: product.category || "",
    active: product.active,
    errors: {} as ProductFieldErrors,
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingUpdate(true);

    // Convert string values to appropriate types
    const productData = {
      ...state,
      price: parseFloat(state.price),
      stock_quantity: parseInt(state.stock_quantity),
      alert_threshold: parseInt(state.alert_threshold),
    };

    ProductService.updateProduct(product.id, productData)
      .then((res) => {
        if (res.status === 200) {
          onProductUpdated(res.data.message);
        } else {
          console.error(
            "Unexpected status error while updating product: ",
            res.status
          );
        }
      })
      .catch((error) => {
        if (error.response?.status === 422) {
          setState((prevState) => ({
            ...prevState,
            errors: error.response.data.errors,
          }));
        } else {
          ErrorHandler(error, null);
        }
      })
      .finally(() => {
        setLoadingUpdate(false);
      });
  };

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setSubmitForm.current = () => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    };
  }, [setSubmitForm]);

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="edit-name">Product Name</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.name ? "is-invalid" : ""
                }`}
                name="name"
                id="edit-name"
                value={state.name}
                onChange={handleInputChange}
              />
              {state.errors.name && (
                <span className="text-danger">{state.errors.name[0]}</span>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="edit-description">Description</label>
              <textarea
                className={`form-control ${
                  state.errors.description ? "is-invalid" : ""
                }`}
                name="description"
                id="edit-description"
                value={state.description}
                onChange={handleInputChange}
                rows={3}
              />
              {state.errors.description && (
                <span className="text-danger">
                  {state.errors.description[0]}
                </span>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="edit-price">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`form-control ${
                  state.errors.price ? "is-invalid" : ""
                }`}
                name="price"
                id="edit-price"
                value={state.price}
                onChange={handleInputChange}
              />
              {state.errors.price && (
                <span className="text-danger">{state.errors.price[0]}</span>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="edit-stock_quantity">Stock Quantity</label>
              <input
                type="number"
                min="0"
                className={`form-control ${
                  state.errors.stock_quantity ? "is-invalid" : ""
                }`}
                name="stock_quantity"
                id="edit-stock_quantity"
                value={state.stock_quantity}
                onChange={handleInputChange}
              />
              {state.errors.stock_quantity && (
                <span className="text-danger">
                  {state.errors.stock_quantity[0]}
                </span>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="edit-alert_threshold">Alert Threshold</label>
              <input
                type="number"
                min="0"
                className={`form-control ${
                  state.errors.alert_threshold ? "is-invalid" : ""
                }`}
                name="alert_threshold"
                id="edit-alert_threshold"
                value={state.alert_threshold}
                onChange={handleInputChange}
              />
              {state.errors.alert_threshold && (
                <span className="text-danger">
                  {state.errors.alert_threshold[0]}
                </span>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="edit-sku">SKU</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.sku ? "is-invalid" : ""
                }`}
                name="sku"
                id="edit-sku"
                value={state.sku}
                onChange={handleInputChange}
              />
              {state.errors.sku && (
                <span className="text-danger">{state.errors.sku[0]}</span>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="edit-barcode">Barcode</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.barcode ? "is-invalid" : ""
                }`}
                name="barcode"
                id="edit-barcode"
                value={state.barcode}
                onChange={handleInputChange}
              />
              {state.errors.barcode && (
                <span className="text-danger">{state.errors.barcode[0]}</span>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="edit-category">Category</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.category ? "is-invalid" : ""
                }`}
                name="category"
                id="edit-category"
                value={state.category}
                onChange={handleInputChange}
              />
              {state.errors.category && (
                <span className="text-danger">{state.errors.category[0]}</span>
              )}
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className={`form-check-input ${
                    state.errors.active ? "is-invalid" : ""
                  }`}
                  name="active"
                  id="edit-active"
                  checked={state.active}
                  onChange={handleInputChange}
                />
                <label className="form-check-label" htmlFor="edit-active">
                  Active
                </label>
                {state.errors.active && (
                  <div className="invalid-feedback">
                    {state.errors.active[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default EditProductForm;
