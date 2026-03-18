import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';

export default function DynamicTable({ data }) {
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return Object.keys(data.find(d => !d.isHeader) || data[0])
      .filter(key => key !== 'isHeader')
      .map((key) => ({
        header: key,
        accessorKey: key,
        cell: (info) => {
          const value = info.getValue();
          const isNum = !isNaN(value) && value !== "" && value !== "-";
          const numValue = parseFloat(value);
          const isHeader = info.row.original.isHeader;

          const getBgColor = (val) => {
            if (isHeader || !isNum || key === 'กลุ่มเสี่ยง') return '';
            if (val >= 90) return 'bg-emerald-600 text-white'; 
            if (val >= 70) return 'bg-emerald-100 text-emerald-900 border border-emerald-200'; 
            if (val >= 20) return 'bg-amber-100 text-amber-900 border border-amber-200'; 
            if (val < 20) return 'bg-red-500 text-white'; 
          };

          return (
            <div className={`px-2 py-1 rounded-md font-bold min-w-[60px] shadow-sm
              ${key === 'กลุ่มเสี่ยง' ? 'text-left' : 'text-center'} 
              ${getBgColor(numValue)}`}
            >
              {value === "" ? "-" : value}
            </div>
          );
        },
      }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!data || data.length === 0) return <div className="p-4 text-center text-slate-500 italic">ไม่มีข้อมูล</div>;

  return (
    <div className="w-full h-full flex flex-col border-2 border-slate-300 rounded-xl overflow-hidden bg-white shadow-lg">
      {/* Search Bar */}
      <div className="p-4 bg-slate-100 border-b-2 border-slate-300 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border-2 border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            placeholder="ค้นหากลุ่มเสี่ยง หรือข้อมูล..."
          />
        </div>
        <div className="text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-300">
          พบข้อมูล {table.getFilteredRowModel().rows.length} รายการ
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-200"> {/* พื้นหลังสีเข้มช่วยให้เส้นตารางขาวชัดขึ้น */}
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 z-30">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => (
                  <th 
                    key={header.id} 
                    className={`
                      px-4 py-4 border-b-2 border-r-2 border-slate-300 text-slate-800 font-extrabold bg-slate-100
                      ${idx === 0 ? 'sticky left-0 z-40 border-r-4 border-slate-400 shadow-[2px_0_0_0_rgba(0,0,0,0.1)]' : 'text-center'}
                    `}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => {
                const isHeaderRow = row.original.isHeader;
                return (
                  <tr 
                    key={row.id} 
                    className={`${isHeaderRow ? 'bg-indigo-100/90 font-bold' : 'hover:bg-blue-50/50'} transition-colors`}
                  >
                    {row.getVisibleCells().map((cell, idx) => (
                      <td 
                        key={cell.id} 
                        className={`
                          px-4 py-3 border-b-2 border-r-2 border-slate-200
                          ${idx === 0 ? 'text-left sticky left-0 z-10 bg-inherit font-bold border-r-4 border-slate-300 shadow-[2px_0_0_0_rgba(0,0,0,0.05)]' : 'text-center'}
                          ${isHeaderRow ? 'text-indigo-900 border-slate-300' : 'text-slate-700'}
                        `}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-20 text-center text-slate-500 bg-slate-50">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-slate-300" />
                    <span className="text-lg">ไม่พบข้อมูลที่ตรงกับการค้นหา...</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Legend / Footer */}
      <div className="px-4 py-3 bg-slate-800 text-white flex flex-wrap justify-between items-center border-t-2 border-slate-400">
        <span className="text-xs font-medium">หมายเหตุ: ข้อมูลสรุปผลการคัดกรองวัณโรค</span>
        <div className="flex gap-4 text-[10px] md:text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded border border-white"></div> &lt; 20%</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-100 rounded border border-white"></div> 20-69%</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-100 rounded border border-white"></div> 70-89%</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-600 rounded border border-white"></div> 90%+</div>
        </div>
      </div>
    </div>
  );
}