import axiosClient from "./axiosClient";
const departmentAPI = {
getDepartmentsByYear(year) {
  return axiosClient.get(`api/v1/kpi/groups-kpi/${year}`);
},
getReportByUUID(uuid, year) {
  return axiosClient.get(`api/v1/kpi/topic-detail/${uuid}/${year}`);
}
};

export default departmentAPI;