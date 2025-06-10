import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { ChangeEvent, FormEvent, useState, useRef } from "react";
import { LoginFieldErrors } from "../../../interfaces/LoginFieldErrors";
import ErrorHandler from "../../../handler/ErrorHandler";
import SpinnerSmall from "../../SpinnerSmall";
import AlertMessage from "../../AlertMessage";
import ReCAPTCHA from "react-google-recaptcha";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

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
      errors: {
        ...prevState.errors,
        [name]: undefined,
      },
    }));
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    // Get reCAPTCHA token
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      handleShowAlertMessage("Please complete the CAPTCHA", false, true);
      return;
    }

    setState((prevState) => ({
      ...prevState,
      loadingLogin: true,
      errors: {} as LoginFieldErrors,
    }));

    try {
      await login(state.email, state.password, recaptchaToken);
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response?.status === 422) {
        // Validation errors
        setState((prevState) => ({
          ...prevState,
          errors: error.response.data.errors || {},
        }));
      } else if (error.response?.status === 401) {
        // Invalid credentials
        setState((prevState) => ({
          ...prevState,
          errors: {
            general: [error.response.data.message || "Invalid credentials"],
          },
        }));
        handleShowAlertMessage(
          error.response.data.message || "Invalid credentials",
          false,
          true
        );
      } else {
        // Other errors
        setState((prevState) => ({
          ...prevState,
          errors: {
            general: ["An error occurred during login. Please try again."],
          },
        }));
        handleShowAlertMessage(
          "An error occurred during login. Please try again.",
          false,
          true
        );
      }
    } finally {
      setState((prevState) => ({
        ...prevState,
        loadingLogin: false,
      }));
      // Reset reCAPTCHA
      recaptchaRef.current?.reset();
    }
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
              type="email"
              className={`form-control ${
                state.errors.email ? "is-invalid" : ""
              }`}
              name="email"
              id="email"
              value={state.email}
              onChange={handleInputChange}
              autoFocus
              required
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
              required
            />
            {state.errors.password && (
              <div className="invalid-feedback">{state.errors.password[0]}</div>
            )}
          </div>
          <div className="mb-4 d-flex justify-content-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || ""}
              theme="light"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
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
      </form>
    </>
  );
};

export default LoginForm;
