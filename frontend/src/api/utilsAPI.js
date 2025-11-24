import axiosClient from "./axiosClient";
const utilsAPI = {
getHospitalAppointments() {
  return axiosClient.get("/api/utils/hcode_full_list");
}
,
  getAfiliateAppointments() {
    return axiosClient.get("/api/utils/type_hos_list",);
}


};

export default utilsAPI;