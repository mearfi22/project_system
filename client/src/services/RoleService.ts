import axios from "axios";

const RoleService = {
  loadRoles: () => {
    return axios.get("/api/roles");
  },
};

export default RoleService;
