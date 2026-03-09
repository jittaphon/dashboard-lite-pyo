import axiosClient from "./axiosClient";
const utilsAPI = {
getHospitalAppointments() {
  return axiosClient.get("/api/utils/hcode_full_list");
}
,
  getAfiliateAppointments() {
    return axiosClient.get("/api/utils/type_hos_list",);
},


// ฟังก์ชันใหม่สำหรับดึงรายชื่อตารางของ KPI กลุ่มงานควบคุมโรคติดต่อ
getTableOfKpiOfDiseaseControl() {
  return axiosClient.get(`/api/v1/kpi/getlist-tb-disease-control`);
}


};

export default utilsAPI;