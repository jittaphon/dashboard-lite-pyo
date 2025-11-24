import React, { useEffect, useState } from 'react';
import { Heart, BarChart2, Filter, ChevronDown, TrendingUp, Users, Target, Activity, Donut } from 'lucide-react';
import { Select, Label, Button, SelectValue, Popover, ListBox, ListBoxItem } from 'react-aria-components';
import { ScaleLoader } from 'react-spinners';
import Map from '../components/Map.jsx';
import DonutChart from '../components/DonutChart.jsx';
import DynamicTable from '../components/Tables.jsx';
import {API} from '../api/index.js';
import { aggregateByProvince, aggregateByDistrict } from "../utils/dataProcessor.js";

const S_HT_Screen = () => {
  const provinces = [
    { id: 'all', name: 'ทุกจังหวัด' , pro_code:'all' },
    { id: 'chiangmai', name: 'เชียงใหม่', pro_code:'50' },
    { id: 'chiangrai', name: 'เชียงราย' , pro_code:'57' },
    { id: 'lampang', name: 'ลำปาง' , pro_code:'52' },
    { id: 'lamphun', name: 'ลำพูน', pro_code:'51' },
    { id: 'mae-hong-son', name: 'แม่ฮ่องสอน', pro_code:'58' },
    { id: 'nan', name: 'น่าน' , pro_code:'55' },
    { id: 'phayao', name: 'พะเยา',  pro_code:'56' },
    { id: 'phrae', name: 'แพร่' ,  pro_code:'54' },
  ];

  const fiscalYears = [
    { id: '2568', name: 'ปีงบประมาณ 2568' },
    { id: '2567', name: 'ปีงบประมาณ 2567' },
    { id: '2566', name: 'ปีงบประมาณ 2566' },
    { id: '2565', name: 'ปีงบประมาณ 2565' }
  ];

  const quarters = [
    { id: 'all', name: 'ทุกไตรมาส' },
    { id: 'q1', name: 'ไตรมาสที่ 1' },
    { id: 'q2', name: 'ไตรมาสที่ 2' },
    { id: 'q3', name: 'ไตรมาสที่ 3' },
    { id: 'q4', name: 'ไตรมาสที่ 4' }
  ];

const applyQuarterFilter = (data, quarter) => {
  const base = data.map(item => ({
    ...item,
    originalResult: item.result
  }));

  if (quarter === "all") return base;

  const qKey = {
    q1: "result1",
    q2: "result2", 
    q3: "result3",
    q4: "result4",
  }[quarter];

  return base.map(item => ({
    ...item,
    result: item[qKey]
  }));
};


  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2568');
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [Data, setnData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);



const fetchData = async () => {
  try {
    setIsDataLoading(true);
    const provinceCode = provinces.find(p => p.id === selectedProvince)?.pro_code;

    const params = {
      b_year: selectedYear,
    };

    if (provinceCode !== "all") {
      params.province = provinceCode;
    }

    const response = await API.htApi.getHT_ScreenAppointments(params);

    let summaryData;

if (selectedProvince === "all") {
  summaryData = aggregateByProvince(response.data.data);
} else {
  summaryData = aggregateByDistrict(response.data.data);
}


  let finalData = applyQuarterFilter(summaryData, selectedQuarter);


  // เพิ่ม delay เล็กน้อยเพื่อให้เห็น animation
  await new Promise(resolve => setTimeout(resolve, 300));
  
  setnData(finalData);
  
  setIsDataLoading(false);

  } catch (error) {
    console.error("Error fetching HT Screen Appointments Data:", error);
    setIsDataLoading(false);
  }
};


  useEffect(() => {
    fetchData();
  }, [selectedProvince, selectedYear, selectedQuarter]);
  


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-teal-400/20 to-cyan-300/20 rounded-bl-full"></div>
      
      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pages / Dashboard</p>
              <h1 className="text-3xl font-bold text-gray-800">ร้อยละของประชากรอายุ 35 ปีขึ้นไปที่ได้รับการคัดกรองเพื่อวินิจฉัยโรคความดันโลหิตสูง</h1>
            </div>
          
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Left Column - 2 spans */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Filters Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Filter className="w-5 h-5 text-teal-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">ตัวกรองข้อมูล</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Province Select */}
                  <div>
                    <Select 
                      selectedKey={selectedProvince}
                      onSelectionChange={setSelectedProvince}
                      className="flex flex-col gap-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700 mb-1">จังหวัด</Label>
                      <Button className="flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-400 transition-all">
                        <SelectValue className="text-gray-800 font-medium" />
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </Button>
                      <Popover className="bg-white border-2 border-gray-200 rounded-xl shadow-xl mt-1 w-[--trigger-width]">
                        <ListBox className="outline-none p-2 max-h-60 overflow-auto">
                          {provinces.map((province) => (
                            <ListBoxItem
                              key={province.id}
                              id={province.id}
                              className="px-4 py-2.5 rounded-lg cursor-pointer outline-none hover:bg-teal-50 selected:bg-teal-100 selected:font-bold text-gray-700 transition-colors"
                            >
                              {province.name}
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </Popover>
                    </Select>
                  </div>

                  {/* Fiscal Year Select */}
                  <div>
                    <Select 
                      selectedKey={selectedYear}
                      onSelectionChange={setSelectedYear}
                      className="flex flex-col gap-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700 mb-1">ปีงบประมาณ</Label>
                      <Button className="flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-400 transition-all">
                        <SelectValue className="text-gray-800 font-medium" />
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </Button>
                      <Popover className="bg-white border-2 border-gray-200 rounded-xl shadow-xl mt-1 w-[--trigger-width]">
                        <ListBox className="outline-none p-2">
                          {fiscalYears.map((year) => (
                            <ListBoxItem
                              key={year.id}
                              id={year.id}
                              className="px-4 py-2.5 rounded-lg cursor-pointer outline-none hover:bg-teal-50 selected:bg-teal-100 selected:font-bold text-gray-700 transition-colors"
                            >
                              {year.name}
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </Popover>
                    </Select>
                  </div>

                   <div>
                    <Select 
                      selectedKey={selectedQuarter}
                      onSelectionChange={setSelectedQuarter}
                      className="flex flex-col gap-2"
                    >
                      <Label className="text-sm font-semibold text-gray-700 mb-1">ไตรมาส</Label>
                      <Button className="flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-400 transition-all">
                        <SelectValue className="text-gray-800 font-medium" />
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </Button>
                      <Popover className="bg-white border-2 border-gray-200 rounded-xl shadow-xl mt-1 w-[--trigger-width]">
                        <ListBox className="outline-none p-2">
                          {quarters.map((quarters) => (
                            <ListBoxItem 
                              key={quarters.id}
                              id={quarters.id}
                              className="px-4 py-2.5 rounded-lg cursor-pointer outline-none hover:bg-teal-50 selected:bg-teal-100 selected:font-bold text-gray-700 transition-colors"
                            >
                              {quarters.name}
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </Popover>
                    </Select>
                  </div>
                  
                </div>

                {/* Active Filters Display */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">ตัวกรองที่เลือก:</p>
                    <button 
                      onClick={() => {
                        setSelectedProvince('all');
                        setSelectedYear('2568');
                        setSelectedQuarter('all');
                      }}
                      className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline transition-colors"
                    >
                      ล้างทั้งหมด
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProvince !== 'all' && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg">
                        <span className="text-xs font-medium text-teal-700">
                          {provinces.find(p => p.id === selectedProvince)?.name}
                        </span>
                        <button
                          onClick={() => setSelectedProvince('all')}
                          className="text-teal-600 hover:text-teal-800 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-xs font-medium text-gray-700">
                        {fiscalYears.find(y => y.id === selectedYear)?.name}
                      </span>
                    </div>
                    
                    {selectedQuarter !== 'all' && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-xs font-medium text-blue-700">
                          {quarters.find(q => q.id === selectedQuarter)?.name}
                        </span>
                        <button
                          onClick={() => setSelectedQuarter('all')}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    {selectedProvince === 'all' && selectedQuarter === 'all' && (
                      <p className="text-xs text-gray-400 italic mt-2">ไม่มีตัวกรองเพิ่มเติม</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Map Card */}
              <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 ${
                isDataLoading ? 'opacity-50 scale-[0.99]' : 'opacity-100 scale-100'
              }`}>
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-800">แผนที่พื้นที่เขตสุขภาพที่ 1</h3>
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                      {isDataLoading ? 'Loading...' : 'Interactive'}
                    </span>
                  </div>
                </div>
                <div className="p-0 relative">
                  <div className={`transition-opacity duration-500 ${isDataLoading ? 'opacity-30' : 'opacity-100'}`}>
                    <Map
                      selectedProCode={
                        provinces.find(p => p.id === selectedProvince)?.pro_code
                      }
                      data={Data}
                      Q={selectedQuarter}
                    />
                  </div>
                  {isDataLoading && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                      <div className="flex flex-col items-center gap-4">
                        <ScaleLoader 
                          color="#14b8a6" 
                          height={50}
                          width={6}
                          radius={3}
                          margin={3}
                        />
                        <p className="text-sm font-semibold text-teal-600">กำลังโหลดข้อมูล...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

{/* Right Column - Info Card + Donut Chart */}
<div className="space-y-6">
  {/* Info Card with Gradient */}
  <div className="bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-6 mb-7 text-white shadow-sm border border-teal-300">
    <div className="flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-4 backdrop-blur-sm">
      <Heart className="w-7 h-7 text-white" />
    </div>
    <h3 className="text-xl font-bold mb-2">
     โรคความดันโลหิตสูง(HT)
    </h3>
    <p className="text-teal-50 text-base leading-relaxed">
      ติดตามและวิเคราะห์ข้อมูลการคัดกรองโรคความดันโลหิตสูง(HT)ในเขตสุขภาพที่ 1 
      เพื่อการบริหารจัดการที่มีประสิทธิภาพ
    </p>
    
  </div>

  {/* Donut Chart */}
 
    <DonutChart
      selectedProCode={provinces.find(p => p.id === selectedProvince)?.pro_code}
      data={Data}
      Q={selectedQuarter}
    />

</div>

          </div>

          {/* Bottom Section - Data Table */}
          <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-500 ${
            isDataLoading ? 'opacity-50 scale-[0.99]' : 'opacity-100 scale-100'
          }`}>
      
            
            <div className="">
              
              <DynamicTable
                selectedProCode={provinces.find(p => p.id === selectedProvince)?.pro_code}
                data={Data}
                Q={selectedQuarter}
              />
              
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 Healthcare Dashboard. Last updated: {new Date().toLocaleTimeString('th-TH')}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default S_HT_Screen;