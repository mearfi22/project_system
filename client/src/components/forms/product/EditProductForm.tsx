import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Product } from "../../../interfaces/Products";
import ProductService from "../../../services/ProductService";
import ErrorHandler from "../../../handler/ErrorHandler";

interface EditProductFormProps {
  product: Product;
  setSubmitForm: React.MutableRefObject<(() => void) | null>;
  setLoadingUpdate: (loading: boolean) => void;
  onProductUpdated: (updatedProduct: Product, message: string) => void;
}

interface ProductFieldErrors {
  name?: string[];
  description?: string[];
  price?: string[];
  stock_quantity?: string[];
  alert_threshold?: string[];
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
    barcode: product.barcode || "",
    category: product.category || "",
    active: product.stock_quantity > 0,
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
      name: state.name.trim(),
      description: state.description.trim(),
      price: parseFloat(state.price),
      stock_quantity: parseInt(state.stock_quantity),
      alert_threshold: parseInt(state.alert_threshold),
      barcode: state.barcode.trim(),
      category: state.category.trim(),
      active: parseInt(state.stock_quantity) > 0,
    };

    // Validate required fields
    if (!productData.name) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          name: ["Product name is required"],
        },
      }));
      setLoadingUpdate(false);
      return;
    }

    if (isNaN(productData.price) || productData.price < 0) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          price: ["Price must be a valid number greater than or equal to 0"],
        },
      }));
      setLoadingUpdate(false);
      return;
    }

    if (isNaN(productData.stock_quantity) || productData.stock_quantity < 0) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          stock_quantity: [
            "Stock quantity must be a valid number greater than or equal to 0",
          ],
        },
      }));
      setLoadingUpdate(false);
      return;
    }

    if (isNaN(productData.alert_threshold) || productData.alert_threshold < 0) {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          alert_threshold: [
            "Alert threshold must be a valid number greater than or equal to 0",
          ],
        },
      }));
      setLoadingUpdate(false);
      return;
    }

    ProductService.updateProduct(product.id, productData)
      .then((res) => {
        if (res.data?.message) {
          // Pass both the updated product and message to the parent
          onProductUpdated(res.data.product, res.data.message);
        } else {
          onProductUpdated(
            { ...product, ...productData },
            "Product updated successfully"
          );
        }
      })
      .catch((error) => {
        if (error.response?.status === 422 && error.response?.data?.errors) {
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
              <div className="form-check form-switch">
                <input
                  type="checkbox"
                  className="form-check-input"
                  name="active"
                  id="edit-active"
                  checked={state.active}
                  onChange={handleInputChange}
                  disabled={parseInt(state.stock_quantity) <= 0}
                />
                <label className="form-check-label" htmlFor="edit-active">
                  Active
                </label>
                {parseInt(state.stock_quantity) <= 0 && (
                  <small className="text-muted d-block">
                    Product is automatically inactive when stock is 0
                  </small>
                )}
              </div>
              {state.errors.active && (
                <span className="text-danger">{state.errors.active[0]}</span>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default EditProductForm;
