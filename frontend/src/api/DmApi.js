import axiosClient from "./axiosClient";
const htApi = {
getDM_ScreenAppointments(params) {
  return axiosClient.get("/api/v1/kpi/dm-screen", { params });
}

,


};

export default htApi;