import { useState } from "react";
import AddUserModal from "../../components/modals/user/AddUserModal";
import UsersTable from "../../components/tables/user/UsersTable";
import EditUserModal from "../../components/modals/user/EditUserModal";
import type { Users } from "../../interfaces/Users";
import DeleteUserModal from "../../components/modals/user/DeleteUserModal";

const Users = () => {
  const [refreshUsers, setRefreshUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [openEditUserModal, setOpenEditUserModal] = useState(false);
  const [openDeleteUserModal, setOpenDeleteUserModal] = useState(false);

  const handleOpenEditUserModal = (user: Users) => {
    setSelectedUser(user);
    setOpenEditUserModal(true);
  };

  const handleCloseEditUserModal = () => {
    setSelectedUser(null);
    setOpenEditUserModal(false);
  };

  const handleOpenDeleteUserModal = (user: Users) => {
    setSelectedUser(user);
    setOpenDeleteUserModal(true);
  };

  const handleCloseDeleteUserModal = () => {
    setSelectedUser(null);
    setOpenDeleteUserModal(false);
  };

  return (
    <div className="container-fluid px-4">
      {/* Header Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 text-primary">Users Management</h5>
              <p className="text-muted mb-0 small">Manage your system users</p>
            </div>
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => setOpenAddUserModal(true)}
            >
              <i className="bi bi-plus-circle"></i>
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <UsersTable
            refreshUsers={refreshUsers}
            onEditUser={handleOpenEditUserModal}
            onDeleteUser={handleOpenDeleteUserModal}
          />
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        showModal={openAddUserModal}
        onRefreshUsers={() => setRefreshUsers(!refreshUsers)}
        onClose={() => setOpenAddUserModal(false)}
      />
      <EditUserModal
        showModal={openEditUserModal}
        user={selectedUser}
        onRefreshUsers={() => setRefreshUsers(!refreshUsers)}
        onClose={handleCloseEditUserModal}
      />
      <DeleteUserModal
        showModal={openDeleteUserModal}
        user={selectedUser}
        onRefreshUsers={() => setRefreshUsers(!refreshUsers)}
        onClose={handleCloseDeleteUserModal}
      />
    </div>
  );
};

export default Users;
