import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Search, ChevronUp, ChevronDown, ArrowUpDown, Hospital } from 'lucide-react';

const columnLabels = {
  district: "หน่วยบริการ",
  on_treatment: "กำลังรักษา",
  death: "เสียชีวิต",
  success: "สำเร็จ",
  ltfu: "ขาดยา",
  transfer_out: "โอนออก",
  rr_mdr: "RR/MDR ก่อนเดือนที่ 5",
  total_cases: "รวม",
  net_cases: "คงเหลือรักษา",
  death_rate: "% เสียชีวิต",
  ltfu_rate: "% ขาดยา",
  success_rate: "% สำเร็จ",
  transfer_out_rate: "% โอนออก",
  total_rate: "รวม%"
};

export default function DynamicTable({ data }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];

    return Object.keys(data[0]).map((key) => ({
      header: columnLabels[key] || key,
      accessorKey: key,
      cell: (info) => {
        const value = info.getValue();

        // คอลัมน์ หน่วยบริการ
        if (key === 'district') {
          return (
            <div className="flex items-center gap-2">
              <Hospital className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">รพ.{value}</span>
            </div>
          );
        }

        // คอลัมน์ รวม (total_cases)
        if (key === 'total_cases') {
          return (
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200 min-w-[60px] text-center">
                {value ?? '0'}
              </span>
            </div>
          );
        }

        // คอลัมน์ รวม% (total_rate)
        if (key === 'total_rate') {
          return (
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200 min-w-[60px] text-center">
                {value ?? '0'}%
              </span>
            </div>
          );
        }

        // คอลัมน์ % อื่นๆ (ยกเว้น total_rate)
        if (key.includes('_rate') && key !== 'total_rate') {
          return (
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 min-w-[60px] text-center">
                {value ?? '0'}%
              </span>
            </div>
          );
        }

        return <div className="text-center text-slate-600">{value ?? '-'}</div>;
      }
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search Header */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="ค้นหาข้อมูล..."
            className="w-full md:w-72 bg-white border border-slate-200 text-slate-700 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="text-slate-500 text-sm">
          จำนวน <span className="text-slate-900 font-bold">{table.getRowModel().rows.length}</span> แห่ง
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            {table.getHeaderGroups().map(h => (
              <tr key={h.id} className="bg-slate-50">
                {h.headers.map(header => (
                  <th
                    key={header.id}
                    className="border border-slate-200 p-4 text-slate-500 font-bold cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="inline-block">
                        {{
                          asc: <ChevronUp className="w-4 h-4 text-emerald-600" />,
                          desc: <ChevronDown className="w-4 h-4 text-emerald-600" />,
                        }[header.column.getIsSorted()] ?? <ArrowUpDown className="w-3.5 h-3.5 opacity-20" />}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`transition-colors hover:bg-blue-50/30 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="border border-slate-200 p-4 align-middle"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="border border-slate-200 p-12 text-center text-slate-400">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 text-center italic">
        * คลิกที่หัวตารางเพื่อเรียงลำดับข้อมูลจากมากไปน้อยหรือน้อยไปมาก
      </div>
    </div>
  );
}