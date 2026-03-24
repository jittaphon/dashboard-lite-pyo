import axiosClient from "./axiosClient";
const dcdepartmentAPI = {
postSaveScreeningResults(data) {
  return axiosClient.post(`api/v1/kpi/save-screening-results`, data);
},  
postSaveRiskScore(data) {
  return axiosClient.post(`api/v1/kpi/save-risk-score`, data);
},
postSaveRiskScoreWalkinScreen(data) {
  return axiosClient.post(`api/v1/kpi/save-risk-score-walkin-screen`, data);
},
getScreeningResults(params) {
  return axiosClient.get(`api/v1/kpi/get-screening-results`, { params });
}
};

export default dcdepartmentAPI;