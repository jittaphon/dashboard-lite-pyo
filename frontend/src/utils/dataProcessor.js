// utils/dataProcessor.js
export const aggregateByProvince = (rawData) => {

  const result = {};

  for (const item of rawData) {
    const pro = item.province;

    if (!result[pro]) {
      result[pro] = { province: pro };
    }

    for (const [key, value] of Object.entries(item)) {
      const num = Number(value);

      // เงื่อนไขรวมเฉพาะค่าที่เป็นตัวเลข
      if (!isNaN(num) && key !== "province" && key !== "hospcode" && key !== "areacode" && key !== "b_year" && key !== "id" && key !== "date_com") {
        if (!result[pro][key]) result[pro][key] = 0;
        result[pro][key] += num;
      }
    }
  }

  return Object.values(result);
};


export const aggregateByDistrict = (rawData) => {
  const result = {};

  for (const item of rawData) {
    // แยกอำเภอจาก areacode เช่น 56090300
    const area = item.areacode?.toString() ?? "";
    const amp = area.substring(0, 4); // 5609

    if (!result[amp]) {
      result[amp] = { amp_code: amp };
    }

    for (const [key, value] of Object.entries(item)) {
      const num = Number(value);

      if (!isNaN(num) &&
        key !== "province" &&
        key !== "hospcode" &&
        key !== "areacode" &&
        key !== "b_year" &&
        key !== "id" &&
        key !== "date_com"
      ) {
        if (!result[amp][key]) result[amp][key] = 0;
        result[amp][key] += num;
      }
    }
  }

  return Object.values(result);
};
