import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Genders } from "../../../interfaces/Genders";
import { UserFieldErrors } from "../../../interfaces/UserFielderrors";
import GenderService from "../../../services/GenderService";
import RoleService from "../../../services/RoleService";
import ErrorHandler from "../../../handler/ErrorHandler";
import { Users } from "../../../interfaces/Users";
import UserService from "../../../services/UserService";
import { Roles } from "../../../interfaces/Roles";

interface EditUserFormProps {
  user: Users | null;
  setSubmitForm: React.MutableRefObject<(() => void) | null>;
  setLoadingUpdate: (loading: boolean) => void;
  onUserUpdated: (message: string) => void;
}

const EditUserForm = ({
  user,
  setSubmitForm,
  setLoadingUpdate,
  onUserUpdated,
}: EditUserFormProps) => {
  const [state, setState] = useState({
    loadingGenders: true,
    loadingRoles: true,
    genders: [] as Genders[],
    roles: [] as Roles[],
    user_id: 0,
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix_name: "",
    birth_date: "",
    gender: "",
    role: "",
    address: "",
    contact_number: "",
    email: "",
    password: "",
    password_confirmation: "",
    errors: {} as UserFieldErrors,
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLoadGenders = () => {
    GenderService.loadGenders()
      .then((res) => {
        if (res.status === 200) {
          setState((prevState) => ({
            ...prevState,
            genders: res.data.genders,
          }));
        } else {
          console.error(
            "Unexpected status error while loading genders: ",
            res.status
          );
        }
      })
      .catch((error) => {
        ErrorHandler(error, null);
      })
      .finally(() => {
        setState((prevState) => ({
          ...prevState,
          loadingGenders: false,
        }));
      });
  };

  const handleLoadRoles = () => {
    RoleService.loadRoles()
      .then((res) => {
        if (res.status === 200) {
          setState((prevState) => ({
            ...prevState,
            roles: res.data.roles,
          }));
        } else {
          console.error(
            "Unexpected status error while loading roles: ",
            res.status
          );
        }
      })
      .catch((error) => {
        ErrorHandler(error, null);
      })
      .finally(() => {
        setState((prevState) => ({
          ...prevState,
          loadingRoles: false,
        }));
      });
  };

  const handleUpdateUser = (e: FormEvent) => {
    e.preventDefault();

    setLoadingUpdate(true);

    UserService.updateUser(state.user_id, state)
      .then((res) => {
        if (res.status === 200) {
          onUserUpdated(res.data.message);
        } else {
          console.error(
            "Unexpected status error while updating user: ",
            res.status
          );
        }
      })
      .catch((error) => {
        if (error.response.status === 422) {
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
    handleLoadGenders();
    handleLoadRoles();

    if (user) {
      setState((prevState) => ({
        ...prevState,
        user_id: user.user_id,
        first_name: user.first_name || "",
        middle_name: user.middle_name || "",
        last_name: user.last_name || "",
        suffix_name: user.suffix_name || "",
        birth_date: user.birth_date || "",
        gender: user.gender?.gender_id?.toString() || "",
        role: user.role?.id?.toString() || "",
        address: user.address || "",
        contact_number: user.contact_number || "",
        email: user.email || "",
        password: "",
        password_confirmation: "",
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        user_id: 0,
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix_name: "",
        birth_date: "",
        gender: "",
        role: "",
        address: "",
        contact_number: "",
        email: "",
        password: "",
        password_confirmation: "",
        errors: {} as UserFieldErrors,
      }));
    }

    setSubmitForm.current = () => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    };
  }, [user, setSubmitForm]);

  return (
    <>
      <form ref={formRef} onSubmit={handleUpdateUser}>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="edit-first_name">First Name</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.first_name ? "is-invalid" : ""
                }`}
                name="first_name"
                id="edit-first_name"
                value={state.first_name}
                onChange={handleInputChange}
              />
              {state.errors.first_name && (
                <span className="text-danger">
                  {state.errors.first_name[0]}
                </span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-middle_name">Middle Name</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.middle_name ? "is-invalid" : ""
                }`}
                name="middle_name"
                id="edit-middle_name"
                value={state.middle_name}
                onChange={handleInputChange}
              />
              {state.errors.middle_name && (
                <span className="text-danger">
                  {state.errors.middle_name[0]}
                </span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-last_name">Last Name</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.last_name ? "is-invalid" : ""
                }`}
                name="last_name"
                id="edit-last_name"
                value={state.last_name}
                onChange={handleInputChange}
              />
              {state.errors.last_name && (
                <span className="text-danger">{state.errors.last_name[0]}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-suffix_name">Suffix Name</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.suffix_name ? "is-invalid" : ""
                }`}
                name="suffix_name"
                id="edit-suffix_name"
                value={state.suffix_name}
                onChange={handleInputChange}
              />
              {state.errors.suffix_name && (
                <span className="text-danger">
                  {state.errors.suffix_name[0]}
                </span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-birth_date">Birth Date</label>
              <input
                type="date"
                className={`form-control ${
                  state.errors.birth_date ? "is-invalid" : ""
                }`}
                name="birth_date"
                id="edit-birth_date"
                value={state.birth_date}
                onChange={handleInputChange}
              />
              {state.errors.birth_date && (
                <span className="text-danger">
                  {state.errors.birth_date && (
                    <span className="text-danger">
                      {state.errors.birth_date[0]}
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-gender">Gender</label>
              <select
                className={`form-select ${
                  state.errors.gender ? "is-invalid" : ""
                }`}
                name="gender"
                id="edit-gender"
                value={state.gender}
                onChange={handleInputChange}
              >
                <option value="">Select Gender</option>
                {state.loadingGenders ? (
                  <option value="">Loading...</option>
                ) : (
                  state.genders.map((gender, index) => (
                    <option value={gender.gender_id} key={index}>
                      {gender.gender}
                    </option>
                  ))
                )}
              </select>
              {state.errors.gender && (
                <span className="text-danger">{state.errors.gender[0]}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-role">Role</label>
              <select
                className={`form-select ${
                  state.errors.role ? "is-invalid" : ""
                }`}
                name="role"
                id="edit-role"
                value={state.role}
                onChange={handleInputChange}
              >
                <option value="">Select Role</option>
                {state.loadingRoles ? (
                  <option value="">Loading...</option>
                ) : (
                  state.roles.map((role, index) => (
                    <option value={role.id} key={index}>
                      {role.name}
                    </option>
                  ))
                )}
              </select>
              {state.errors.role && (
                <span className="text-danger">{state.errors.role[0]}</span>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="edit-address">Address</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.address ? "is-invalid" : ""
                }`}
                name="address"
                id="edit-address"
                value={state.address}
                onChange={handleInputChange}
              />
              {state.errors.address && (
                <span className="text-danger">{state.errors.address[0]}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-contact_number">Contact Number</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.contact_number ? "is-invalid" : ""
                }`}
                name="contact_number"
                id="edit-contact_number"
                value={state.contact_number}
                onChange={handleInputChange}
              />
              {state.errors.contact_number && (
                <span className="text-danger">
                  {state.errors.contact_number[0]}
                </span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-email">Email</label>
              <input
                type="text"
                className={`form-control ${
                  state.errors.email ? "is-invalid" : ""
                }`}
                name="email"
                id="edit-email"
                value={state.email}
                onChange={handleInputChange}
              />
              {state.errors.email && (
                <span className="text-danger">{state.errors.email[0]}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-password">Password</label>
              <input
                type="password"
                className={`form-control ${
                  state.errors.password ? "is-invalid" : ""
                }`}
                name="password"
                id="edit-password"
                value={state.password}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current password"
              />
              <small className="form-text text-muted">
                If changing password, it must contain at least:
                <ul className="mb-0">
                  <li>8 characters long</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                  <li>One special character (@$!%*?&)</li>
                </ul>
              </small>
              {state.errors.password && (
                <span className="text-danger">{state.errors.password[0]}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-password_confirmation">
                Password Confirmation
              </label>
              <input
                type="password"
                className={`form-control ${
                  state.errors.password_confirmation ? "is-invalid" : ""
                }`}
                name="password_confirmation"
                id="edit-password_confirmation"
                value={state.password_confirmation}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current password"
              />
              {state.errors.password_confirmation && (
                <span className="text-danger">
                  {state.errors.password_confirmation[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default EditUserForm;
