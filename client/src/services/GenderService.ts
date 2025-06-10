import AxiosInstance from "../AxiosInstance";

const GenderService = {
  loadGenders: async () => {
    return AxiosInstance.get("/api/loadGenders")
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  },
  getGender: async (genderId: number) => {
    return AxiosInstance.get(`/api/getGender/${genderId}`)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  },
  storeGender: async (data: any) => {
    return AxiosInstance.post("/api/storeGender", data)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  },
  updateGender: async (genderId: number, data: any) => {
    return AxiosInstance.put(`/api/updateGender/${genderId}`, data)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  },
  destroyGender: async (genderId: number) => {
    return AxiosInstance.put(`/api/destroyGender/${genderId}`)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  },
};

export default GenderService;
