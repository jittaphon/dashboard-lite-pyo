// ConfigTableModal.jsx
import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function ConfigTableModal({ isOpen, onClose, onSave }) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([
    { key: 'id', label: 'ID', width: 80 }
  ]);

  const handleAddColumn = () => {
    setColumns([...columns, { key: '', label: '', width: 100 }]);
  };

  const handleRemoveColumn = (index) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const handleSave = () => {
    const config = {
      title: tableName,
      columns: columns.filter(col => col.key && col.label) // กรองที่กรอกครบ
    };

    onSave(config);
    onClose();
    
    // Reset form
    setTableName('');
    setColumns([{ key: 'id', label: 'ID', width: 80 }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>📋</span>
            <span>ตั้งค่าตารางข้อมูล</span>
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          
          {/* ชื่อตาราง */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ชื่อตาราง
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="เช่น ข้อมูลผู้ป่วยวัณโรค"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* คอลัมน์ */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                คอลัมน์ในตาราง
              </label>
              <button
                onClick={handleAddColumn}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
              >
                <Plus size={16} />
                <span>เพิ่มคอลัมน์</span>
              </button>
            </div>

            <div className="space-y-3">
              {columns.map((col, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                  <input
                    type="text"
                    value={col.key}
                    onChange={(e) => handleColumnChange(index, 'key', e.target.value)}
                    placeholder="key (เช่น name)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={col.label}
                    onChange={(e) => handleColumnChange(index, 'label', e.target.value)}
                    placeholder="ชื่อแสดง (เช่น ชื่อ-สกุล)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={col.width}
                    onChange={(e) => handleColumnChange(index, 'width', parseInt(e.target.value))}
                    placeholder="กว้าง"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  {columns.length > 1 && (
                    <button
                      onClick={() => handleRemoveColumn(index)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={!tableName || columns.filter(c => c.key && c.label).length === 0}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            บันทึก
          </button>
        </div>

      </div>
    </div>
  );
}