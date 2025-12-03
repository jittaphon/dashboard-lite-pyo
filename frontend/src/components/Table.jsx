// DynamicDataTable.jsx

export default function DynamicDataTable({ config }) {
  // Mock data สำหรับแสดงตัวอย่าง
  const mockData = [
    { id: 1, name: 'สมชาย ใจดี', age: 45, status: 'รักษาอยู่' },
    { id: 2, name: 'สมหญิง มีสุข', age: 32, status: 'หายแล้ว' },
    { id: 3, name: 'วิชัย ดีมาก', age: 58, status: 'รักษาอยู่' },
  ];

  if (!config) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">ยังไม่ได้ตั้งค่าตาราง</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-white p-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{config.title}</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-purple-50">
              {config.columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b-2 border-purple-200"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                {config.columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm text-gray-600 border-b border-gray-200"
                  >
                    {row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


