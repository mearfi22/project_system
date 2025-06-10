import AxiosInstance from "../AxiosInstance";

const RoleService = {
  loadRoles: () => {
    return AxiosInstance.get("/api/roles");
  },
};

export default RoleService;
