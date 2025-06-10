import AxiosInstance from "../AxiosInstance";

const UserService = {
  loadUsers: async () => {
    return AxiosInstance.get("/api/loadUsers")
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  },
  storeUser: async (data: any) => {
    return AxiosInstance.post("/api/storeUser", data)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  },
  updateUser: async (userId: number, data: any) => {
    // Format the data to match backend expectations
    const formattedData = {
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      suffix_name: data.suffix_name,
      birth_date: data.birth_date,
      gender: data.gender,
      role: data.role,
      address: data.address,
      contact_number: data.contact_number,
      email: data.email,
      ...(data.password && {
        password: data.password,
        password_confirmation: data.password_confirmation,
      }),
    };

    return AxiosInstance.put(`/api/updateUser/${userId}`, formattedData)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  },
  destroyUser: async (userId: number) => {
    return AxiosInstance.put(`/api/destroyUser/${userId}`)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  },
};

export default UserService;
