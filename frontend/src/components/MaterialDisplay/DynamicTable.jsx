// components/DynamicTable.jsx
import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from '@tanstack/react-table';

export default function DynamicTable({ data }) {
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return Object.keys(data[0]).map((key) => ({
      header: key,
      accessorKey: key,
      cell: (info) => {
        const value = info.getValue();
        return value === null || value === undefined ? '-' : String(value);
      },
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!data || data.length === 0) return <div className="p-4 text-center text-slate-500">ไม่มีข้อมูล</div>;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3 border-b border-slate-200 whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-3 whitespace-nowrap text-slate-600">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t">
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 bg-white border rounded text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
          >
            ก่อนหน้า
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 bg-white border rounded text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
          >
            ถัดไป
          </button>
        </div>
        <span className="text-sm text-slate-600 font-medium">
          หน้า {table.getState().pagination.pageIndex + 1} จาก {table.getPageCount()}
        </span>
      </div>
    </div>
  );
}