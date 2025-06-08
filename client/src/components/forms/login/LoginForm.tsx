import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { ChangeEvent, FormEvent, useState } from "react";
import { LoginFieldErrors } from "../../../interfaces/LoginFieldErrors";
import ErrorHandler from "../../../handler/ErrorHandler";
import SpinnerSmall from "../../SpinnerSmall";
import AlertMessage from "../../AlertMessage";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({
    loadingLogin: false,
    email: "",
    password: "",
    errors: {} as LoginFieldErrors,
  });

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();

    setState((prevState) => ({
      ...prevState,
      loadingLogin: true,
    }));

    login(state.email, state.password)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        if (error.response?.status === 422) {
          setState((prevState) => ({
            ...prevState,
            errors: error.response.data.errors,
          }));
        } else if (error.response?.status === 401) {
          handleShowAlertMessage(error.response.data.message, false, true);
        } else {
          ErrorHandler(error, null);
        }
      })
      .finally(() => {
        setState((prevState) => ({
          ...prevState,
          loadingLogin: false,
        }));
      });
  };

  const handleShowAlertMessage = (
    message: string,
    isSuccess: boolean,
    isVisible: boolean
  ) => {
    setMessage(message);
    setIsSuccess(isSuccess);
    setIsVisible(isVisible);
  };

  const handleCloseAlertMessage = () => {
    setMessage("");
    setIsSuccess(false);
    setIsVisible(false);
  };

  return (
    <>
      <AlertMessage
        message={message}
        isSuccess={isSuccess}
        isVisible={isVisible}
        onClose={handleCloseAlertMessage}
      />
      <form onSubmit={handleLogin} className="card">
        <div className="card-body">
          <h3 className="card-title text-center mb-4">Login</h3>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="text"
              className={`form-control ${
                state.errors.email ? "is-invalid" : ""
              }`}
              name="email"
              id="email"
              value={state.email}
              onChange={handleInputChange}
              autoFocus
            />
            {state.errors.email && (
              <div className="invalid-feedback">{state.errors.email[0]}</div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className={`form-control ${
                state.errors.password ? "is-invalid" : ""
              }`}
              name="password"
              id="password"
              value={state.password}
              onChange={handleInputChange}
            />
            {state.errors.password && (
              <div className="invalid-feedback">{state.errors.password[0]}</div>
            )}
          </div>
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={state.loadingLogin}
            >
              {state.loadingLogin ? (
                <>
                  <SpinnerSmall /> Logging In...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default LoginForm;
