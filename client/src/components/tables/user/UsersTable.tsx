import { useEffect, useState } from "react";
import { Users } from "../../../interfaces/Users";
import UserService from "../../../services/UserService";
import ErrorHandler from "../../../handler/ErrorHandler";
import Spinner from "../../Spinner";

interface UsersTableProps {
  refreshUsers: boolean;
  onEditUser: (user: Users) => void;
  onDeleteUser: (user: Users) => void;
}

const UsersTable = ({
  refreshUsers,
  onEditUser,
  onDeleteUser,
}: UsersTableProps) => {
  const [state, setState] = useState({
    loadingUsers: true,
    users: [] as Users[],
    searchTerm: "",
  });

  const handleLoadUsers = () => {
    UserService.loadUsers()
      .then((res) => {
        if (res.status === 200) {
          setState((prevState) => ({
            ...prevState,
            users: res.data.users,
          }));
        } else {
          console.error(
            "Unexpected status error while loading users: ",
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
          loadingUsers: false,
        }));
      });
  };

  const handleUsersFullName = (user: Users) => {
    let fullName = "";

    if (user.middle_name) {
      fullName = `${user.last_name}, ${
        user.first_name
      } ${user.middle_name.charAt(0)}.`;
    } else {
      fullName = `${user.last_name}, ${user.first_name}`;
    }

    if (user.suffix_name) {
      fullName += ` ${user.suffix_name}`;
    }

    return fullName;
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, searchTerm: event.target.value }));
  };

  const filteredUsers = state.users.filter((user) => {
    const searchTerm = state.searchTerm.toLowerCase();
    return (
      handleUsersFullName(user).toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.contact_number.toLowerCase().includes(searchTerm) ||
      user.role.name.toLowerCase().includes(searchTerm)
    );
  });

  useEffect(() => {
    handleLoadUsers();
  }, [refreshUsers]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search users by name, email, contact number or role..."
            value={state.searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="bg-light">
            <tr>
              <th className="text-nowrap">User Info</th>
              <th className="text-nowrap">Contact Details</th>
              <th className="text-nowrap">Role</th>
              <th className="text-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.loadingUsers ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  <Spinner />
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.user_id}>
                  <td>
                    <div className="d-flex flex-column">
                      <span className="fw-medium">
                        {handleUsersFullName(user)}
                      </span>
                      <small className="text-muted">
                        {user.gender.gender} • {formatDate(user.birth_date)}
                      </small>
                      <small className="text-muted">{user.address}</small>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <span>{user.email}</span>
                      <small className="text-muted">
                        {user.contact_number}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge rounded-pill bg-${
                        user.role.name === "admin"
                          ? "danger"
                          : user.role.name === "manager"
                          ? "warning"
                          : "info"
                      }`}
                    >
                      {user.role.name.charAt(0).toUpperCase() +
                        user.role.name.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => onEditUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => onDeleteUser(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted">
                  {state.searchTerm ? (
                    <>
                      <i className="bi bi-search display-6 d-block mb-2"></i>
                      No users found matching "{state.searchTerm}"
                    </>
                  ) : (
                    <>
                      <i className="bi bi-people display-6 d-block mb-2"></i>
                      No users available
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UsersTable;
