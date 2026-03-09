import axiosClient from "./axiosClient";
const departmentAPI = {
getDepartmentsByYear(year) {
  return axiosClient.get(`api/v1/kpi/groups-kpi/${year}`);
}

};

export default departmentAPI;