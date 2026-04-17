import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Search, ChevronUp, ChevronDown, ArrowUpDown, Hospital, Target, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

const columnLabels = {
  area: "อำเภอ",
  target: "เป้าหมาย (TCR)",
  pt: "ผู้ป่วย (ผลงาน)",
  remaining: "คงเหลือ",
  achievement: "% ความครอบคลุม"
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
        const row = info.row.original;
        const isTotalRow = row.area === 'รวม';

        // 1. คอลัมน์ หน่วยบริการ (area)
        if (key === 'area') {
          return (
            <div className="flex items-center gap-2">
              {isTotalRow ? (
                <span className="font-bold text-slate-900">รวมทั้งหมด</span>
              ) : (
                <>
                  <Hospital className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-slate-700">อ.{value}</span>
                </>
              )}
            </div>
          );
        }

        // 2. คอลัมน์เป้าหมาย (target)
        if (key === 'target') {
          return (
            <div className="flex justify-center items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-600">{value}</span>
            </div>
          );
        }

        // 3. คอลัมน์ผลงาน (pt)
        if (key === 'pt') {
          return (
            <div className="flex justify-center">
              <span className={`px-3 py-1 rounded-full font-bold min-w-[50px] text-center ${
                isTotalRow ? 'bg-emerald-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                {value}
              </span>
            </div>
          );
        }

        // 4. คอลัมน์คงเหลือ (remaining)
        if (key === 'remaining') {
          return (
            <div className="flex justify-center">
              <span className={`font-medium ${value > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                {value <= 0 ? '-' : value}
              </span>
            </div>
          );
        }

        // 5. คอลัมน์ % ความสำเร็จ (achievement)
        if (key === 'achievement') {
          const val = parseFloat(value);
          return (
            <div className="flex justify-center items-center gap-2">
              <div className="w-full max-w-[100px] bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${Math.min(val, 100)}%` }}
                />
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 min-w-[70px] text-center">
                {value}%
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
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search Header */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="ค้นหาชื่ออำเภอ..."
            className="w-full md:w-72 bg-slate-50 border border-slate-200 text-slate-700 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Users className="w-4 h-4" />
          พบข้อมูล <span className="text-emerald-600 font-bold">{table.getRowModel().rows.length}</span> รายการ
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            {table.getHeaderGroups().map(h => (
              <tr key={h.id} className="bg-gradient-to-r from-emerald-600/95 to-teal-600/95">
                {h.headers.map(header => (
                  <th
                    key={header.id}
                    className="p-4 text-white font-semibold cursor-pointer hover:brightness-110 transition-all whitespace-nowrap border-r border-white/10 last:border-0"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <span className="inline-block transition-transform">
                        {{
                          asc: <ChevronUp className="w-4 h-4 text-white" />,
                          desc: <ChevronDown className="w-4 h-4 text-white" />,
                        }[header.column.getIsSorted()] ?? <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const isTotalRow = row.original.area === 'รวม';
                return (
                  <tr
                    key={row.id}
                    className={`transition-colors border-b border-slate-100 last:border-0 
                      ${isTotalRow ? 'bg-emerald-50/50' : 'hover:bg-slate-50/80 bg-white'}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <span>ไม่พบข้อมูลที่ค้นหา</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        ข้อมูลอัปเดตล่าสุดตามเกณฑ์ทะเบียนผู้ป่วย New & Relapse
      </div>
    </div>
  );
}