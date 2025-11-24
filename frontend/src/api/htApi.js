import axiosClient from "./axiosClient";
const htApi = {
getHT_ScreenAppointments(params) {
  return axiosClient.get("/api/v1/kpi/ht-screen", { params });
}

,


};

export default htApi;