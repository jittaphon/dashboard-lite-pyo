import { useEffect, useState, useMemo } from "react";
import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";

import { loadFilteredGeoJSON, mergeValueIntoGeoData } from "../utils/geoUtils";
import BarChart from "./BarChart";
export default function Tables({ selectedProCode, data, Q }) {
  console.log("Tables Component Props:", { selectedProCode, data, Q });
  const [mergedGeoData, setMergedGeoData] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // "table" or "chart"

  useEffect(() => {
    const loadGeo = async () => {
      try {
        const Data = await loadFilteredGeoJSON(selectedProCode);
        const type = selectedProCode === "all" ? "province" : "district";
        const merged = mergeValueIntoGeoData(Data, data, type);

        let rows =
          merged?.features?.map((f) => ({
            name: f.properties.amp_th || f.properties.pro_th,
            target: f.properties.target,
            originalResult: f.properties.originalResult,
            result1: f.properties.result1,
            result2: f.properties.result2,
            result3: f.properties.result3,
            result4: f.properties.result4,
          })) || [];

        setMergedGeoData(rows);
      } catch (err) {
        console.error("โหลด GeoJSON ล้มเหลว:", err);
      }
    };

    loadGeo();
  }, [selectedProCode, data, Q]);

  // helper สำหรับ format ตัวเลข
  const formatNumber = (num) =>
    num != null ? num.toLocaleString("th-TH") : "-";

  
  const makeTotalRow = (rows) => {
  const sum = (key) =>
    rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

  return {
    name: "รวมทั้งหมด",
    target: sum("target"),
    originalResult: sum("originalResult"),
    result1: sum("result1"),
    result2: sum("result2"),
    result3: sum("result3"),
    result4: sum("result4"),
  };
};

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "จังหวัด/อำเภอ", cell: (info) => info.getValue() },
      { accessorKey: "target", header: "เป้า", cell: (info) => formatNumber(info.getValue()) },
      { accessorKey: "originalResult", header: "รวมคัดกรอง", cell: (info) => formatNumber(info.getValue()) },
      { accessorKey: "result1", header: "ไตรมาส 1", cell: (info) => formatNumber(info.getValue()) },
      { accessorKey: "result2", header: "ไตรมาส 2", cell: (info) => formatNumber(info.getValue()) },
      { accessorKey: "result3", header: "ไตรมาส 3", cell: (info) => formatNumber(info.getValue()) },
      { accessorKey: "result4", header: "ไตรมาส 4", cell: (info) => formatNumber(info.getValue()) },
    ],
    []
  );

  const tableData = useMemo(() => {
  if (!mergedGeoData || mergedGeoData.length === 0) return [];

  const totalRow = makeTotalRow(mergedGeoData);
  return [...mergedGeoData, totalRow];
}, [mergedGeoData]);

const table = useReactTable({
  data: tableData,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});





  return (
    <div className="w-full h-full relative p-4 overflow-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          {selectedProCode === "all" ? "ข้อมูลทุกจังหวัด" : "ข้อมูลอำเภอ"}
        </h2>
        
        {/* Liquid Glass Toggle Switch */}
        <div className="relative inline-flex items-center p-1 rounded-full backdrop-blur-xl bg-white/40 shadow-lg border border-white/50">
          {/* Sliding Background */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl transition-all duration-500 ease-out ${
              viewMode === "table" ? "left-1" : "left-[calc(50%+4px-1px)]"
            }`}
            style={{
              boxShadow: "0 8px 32px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.5)"
            }}
          />
          
          {/* Buttons */}
          <button
            onClick={() => setViewMode("table")}
            className={`relative z-10 px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
              viewMode === "table"
                ? "text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            ตาราง
          </button>
          <button
            onClick={() => setViewMode("chart")}
            className={`relative z-10 px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
              viewMode === "chart"
                ? "text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            กราฟ
          </button>
        </div>
      </div>

      {/* Table */}
      {viewMode === "table" && (
        <div className="overflow-auto border rounded-lg shadow-sm">
          <table className="min-w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-2 border border-gray-300 text-left cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === "asc"
                        ? " ▲"
                        : header.column.getIsSorted() === "desc"
                        ? " ▼"
                        : ""}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

           <tbody>
  {table.getRowModel().rows.map((row, idx) => {
    const isTotal = idx === table.getRowModel().rows.length - 1;

    return (
      <tr
        key={row.id}
        className={`${isTotal ? "bg-gray-200 font-bold" : "hover:bg-gray-50"} border-b`}
      >
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id} className="p-2 border border-gray-300">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    );
  })}
</tbody>

          </table>
        </div>
      )}

      {/* Chart View */}
      {viewMode === "chart" && (
        <div className="">
          <BarChart geoData={mergedGeoData} />
        </div>
      )}

      {/* Summary footer */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>สรุป:</strong> แสดงข้อมูลทั้งหมด {mergedGeoData.length} รายการ
        </p>
      </div>
    </div>
  );
}