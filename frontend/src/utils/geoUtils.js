// utils/geoUtils.js

/**
 * Cache สำหรับเก็บ GeoJSON ไว้ไม่ต้องโหลดซ้ำ
 */
const geoCache = {
  provinces: null,
  districts: null,
  nameMaps: {
    provinces: {},
    districts: {}
  }
};

/**
 * โหลด GeoJSON และ cache ไว้
 * @param {string} type - 'provinces' หรือ 'districts'
 * @returns {Promise<Object>} GeoJSON data
 */
export async function loadGeoJSON(type = 'provinces') {
  const fileName = type === 'provinces' ? 'provinces.geojson' : 'districts.geojson';
  const cacheKey = type;

  // ถ้ามี cache แล้ว return เลย
  if (geoCache[cacheKey]) {
    return geoCache[cacheKey];
  }

  try {
    const response = await fetch(`/ncd/public/${fileName}`);
    const data = await response.json();
    
    // เก็บ cache
    geoCache[cacheKey] = data;
    
    // สร้าง name mapping พร้อมกัน
    buildNameMapping(data, type);
    
    return data;
  } catch (error) {
    console.error(`โหลด ${fileName} ล้มเหลว:`, error);
    throw error;
  }
}

/**
 * สร้าง mapping จาก code -> ชื่อ
 * @param {Object} geoData - GeoJSON data
 * @param {string} type - 'provinces' หรือ 'districts'
 */
function buildNameMapping(geoData, type) {
  if (!geoData?.features) return;

  const mapping = {};
  
  geoData.features.forEach(feature => {
    const props = feature.properties;
    
    if (type === 'provinces') {
      // จังหวัด: pro_code -> pro_namt
      mapping[props.pro_code] = props.pro_namt || props.prov_namt || props.name;
    } else {
      // อำเภอ: amp_code -> amp_namt
      mapping[props.amp_code] = props.amp_namt || props.dist_namt || props.name;
    }
  });

  geoCache.nameMaps[type] = mapping;
}

/**
 * ดึงชื่อจังหวัดจาก code
 * @param {string} provinceCode - รหัสจังหวัด เช่น '50', '51'
 * @returns {Promise<string>} ชื่อจังหวัด
 */
export async function getProvinceName(provinceCode) {
  // ถ้ายังไม่มี mapping ให้โหลด GeoJSON ก่อน
  if (Object.keys(geoCache.nameMaps.provinces).length === 0) {
    await loadGeoJSON('provinces');
  }

  return geoCache.nameMaps.provinces[provinceCode] || provinceCode;
}

/**
 * ดึงชื่ออำเภอจาก code
 * @param {string} districtCode - รหัสอำเภอ เช่น '5201', '5202'
 * @returns {Promise<string>} ชื่อ��ำเภอ
 */
export async function getDistrictName(districtCode) {
  // ถ้ายังไม่มี mapping ให้โหลด GeoJSON ก่อน
  if (Object.keys(geoCache.nameMaps.districts).length === 0) {
    await loadGeoJSON('districts');
  }

  return geoCache.nameMaps.districts[districtCode] || districtCode;
}

/**
 * ดึงชื่อทั้งหมดแบบ batch (ประหยัดกว่า)
 * @param {Array<string>} codes - รายการ code
 * @param {string} type - 'province' หรือ 'district'
 * @returns {Promise<Object>} Object ที่ map code -> ชื่อ
 */
export async function getNamesBatch(codes, type = 'province') {
  const geoType = type === 'province' ? 'provinces' : 'districts';
  
  // โหลด GeoJSON ถ้ายังไม่มี
  if (Object.keys(geoCache.nameMaps[geoType]).length === 0) {
    await loadGeoJSON(geoType);
  }

  const result = {};
  codes.forEach(code => {
    result[code] = geoCache.nameMaps[geoType][code] || code;
  });

  return result;
}

/**
 * เพิ่มชื่อเข้าไปใน data array
 * @param {Array} data - ข้อมูลที่มี province หรือ amp_code
 * @param {string} type - 'province' หรือ 'district'
 * @returns {Promise<Array>} data ที่เพิ่ม field 'name' เข้าไปแล้ว
 */
export async function enrichDataWithNames(data, type = 'province') {
  if (!data || data.length === 0) return data;

  const codeField = type === 'province' ? 'province' : 'amp_code';
  const codes = data.map(item => item[codeField]);
  
  // ดึงชื่อทั้งหมดครั้งเดียว
  const nameMap = await getNamesBatch(codes, type);

  // เพิ่ม name เข้าไปใน data
  return data.map(item => ({
    ...item,
    name: nameMap[item[codeField]]
  }));
}

/**
 * กรอง GeoJSON ตาม zone (สำหรับเขต 1)
 * @param {string} selectedProCode - 'all' หรือ รหัสจังหวัด
 * @returns {Promise<Object>} filtered GeoJSON
 */
export async function loadFilteredGeoJSON(selectedProCode = 'all') {
  const zone1Provinces = ['50', '51', '52', '54', '55', '56', '57', '58'];

  if (selectedProCode === 'all') {
    // โหลดจังหวัดในเขต 1
    const provincesGeo = await loadGeoJSON('provinces');
    
    const filtered = provincesGeo.features.filter(
      f => zone1Provinces.includes(f.properties.pro_code)
    );

    return {
      type: "FeatureCollection",
      features: filtered
    };
  } else {
    // โหลดอำเภอของจังหวัดที่เลือก
    const districtsGeo = await loadGeoJSON('districts');
    
    const filtered = districtsGeo.features.filter(
      f => f.properties.pro_code === selectedProCode
    );

    return {
      type: "FeatureCollection",
      features: filtered
    };
  }
}

/**
 * Merge ข้อมูลเข้ากับ GeoJSON
 * @param {Object} geoData - GeoJSON
 * @param {Array} data - ข้อมูลที่จะ merge
 * @param {string} type - 'province' หรือ 'district'
 * @returns {Object} merged GeoJSON
 */
export function mergeValueIntoGeoData(geoData, data, type = 'province') {
  if (!geoData?.features || !data) return geoData;

  const codeField = type === 'province' ? 'province' : 'amp_code';
  const geoCodeField = type === 'province' ? 'pro_code' : 'amp_code';

  // สร้าง lookup map
  const dataMap = {};
  data.forEach(item => {
    dataMap[item[codeField]] = item;
  });

  // Merge ข้อมูลเข้า properties
  const merged = {
    ...geoData,
    features: geoData.features.map(feature => ({
      ...feature,
      properties: {
        ...feature.properties,
        ...(dataMap[feature.properties[geoCodeField]] || {})
      }
    }))
  };

  return merged;
}

/**
 * Clear cache (ใช้ตอน development หรือต้องการ refresh ข้อมูล)
 */
export function clearGeoCache() {
  geoCache.provinces = null;
  geoCache.districts = null;
  geoCache.nameMaps = {
    provinces: {},
    districts: {}
  };
  console.log('GeoCache cleared');
}

/**
 * ดึง cache stats (debug)
 */
export function getGeoStats() {
  return {
    provincesLoaded: !!geoCache.provinces,
    districtsLoaded: !!geoCache.districts,
    provincesCount: Object.keys(geoCache.nameMaps.provinces).length,
    districtsCount: Object.keys(geoCache.nameMaps.districts).length
  };
}