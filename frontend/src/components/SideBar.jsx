import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Heart, 
  ChevronRight, 
  ChevronLeft,
  Stethoscope,
  Activity,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FullHeightSidebar({ className = '' }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState('ncd');
  const [activeMenu, setActiveMenu] = useState('overview');
  const navigate = useNavigate();
  // ปรับค่าเริ่มต้นบนมือถือให้ปิด
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'ภาพรวม Dashboard',
      path: '/',
    },
    {
      id: 'ncd',
      label: 'NCD KPIs',
      icon: Heart,
      description: 'ตัวชี้วัดโรคไม่ติดต่อเรื้อรัง',
      hasSubMenu: true,
      subMenuItems: [
        { id: 'ht-screen', label: 'คัดกรองความดันโลหิตสูง', path: 's_ht_screen' },
        { id: 'dm-screen', label: 'คัดกรองเบาหวาน', path: 's_dm_screen' },
      ]
    }
  ];

  const toggleSidebar = () => setIsExpanded(!isExpanded);
  
  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };
  const handleMenuClick = (itemId, path) => {
    setActiveMenu(itemId);

    // ปิด sidebar อัตโนมัติเมื่อเป็น mobile
    if (window.innerWidth < 768) {
      setIsExpanded(false);
    }

    if (path.startsWith('/')) {
      navigate(path);
    } else {
      navigate(`/services/${path}`);
    }
  };


  return (
    <div className={`h-full ${className}`}>
      
      {/* Overlay สำหรับมือถือ */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 bg-black/40 md:hidden z-40"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed md:relative
          top-0 left-0 h-full z-50
          transition-all duration-300 ease-out
          bg-gradient-to-b from-[#1e40af] via-[#0891b2] to-[#14b8a6]
          shadow-2xl
          ${isExpanded 
            ? 'translate-x-0 w-64' 
            : 'w-64 md:w-16'
          }
          ${!isExpanded && 'max-md:-translate-x-full'}
        `}
      >
        <div className="relative h-full flex flex-col overflow-hidden">

          {/* Header */}
          <div className="p-3 border-b border-white/20">
            <div className="flex items-center justify-between">

              {/* Logo */}
              <div className={`flex items-center gap-3 transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                </div>

                {isExpanded && (
                  <div className="min-w-0">
                    <h2 className="text-white font-bold text-xs truncate">KPI Health</h2>
                    <p className="text-white/80 text-[10px] truncate">สสจ.พะเยา</p>
                  </div>
                )}
              </div>

              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 flex-shrink-0 shadow-md"
                title={isExpanded ? 'ย่อเมนู' : 'ขยายเมนู'}
              >
                {isExpanded ? (
                  <ChevronLeft className="w-4 h-4 text-white" />
                ) : (
                  <Menu className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              const isExpandedCategory = expandedCategory === item.id;

              return (
                <div key={item.id}>
                  {/* Main Menu */}
                  <button
                    onClick={() => {
                      if (item.hasSubMenu) {
                        toggleCategory(item.id);
                        setActiveMenu(item.id);
                      } else {
                        handleMenuClick(item.id, item.path);
                      }
                    }}
                    className={`
                      w-full group relative rounded-lg transition-all duration-200
                      ${isActive ? 'bg-white/25 shadow-lg backdrop-blur-sm' : 'hover:bg-white/10'}
                    `}
                  >
                    <div className={`flex items-center gap-2.5 p-2.5 ${!isExpanded && 'justify-center'}`}>
                      
                      <div className={`
                        flex-shrink-0 p-2 rounded-lg transition-all duration-200
                        ${isActive ? 'bg-white text-teal-600 shadow-md' : 'bg-white/10 text-white'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {isExpanded && (
                        <>
                          <div className="flex-1 text-left min-w-0">
                            <p className={`
                              font-semibold text-xs truncate transition-colors duration-200
                              ${isActive ? 'text-white' : 'text-white/90'}
                            `}>
                              {item.label}
                            </p>
                            <p className="text-[10px] text-white/70 truncate">
                              {item.description}
                            </p>
                          </div>

                          {item.hasSubMenu && (
                            <ChevronRight
                              className={`
                                w-4 h-4 text-white/80 transition-transform duration-200
                                ${isExpandedCategory ? 'rotate-90' : ''}
                              `}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </button>

                 {/* SubMenu */}
{item.hasSubMenu && isExpandedCategory && (
  <div
    className={`mt-1 ml-3 pl-3 border-l-2 border-white/20 space-y-1 transition-all duration-300
      ${isExpanded ? 'opacity-100 max-h-screen' : 'opacity-100 max-h-screen'} 
    `}
  >
    {item.subMenuItems.map((subItem) => {
      const isSubActive = activeMenu === subItem.id;
      return (
        <button
          key={subItem.id}
          onClick={() => handleMenuClick(subItem.id, subItem.path)}
          className={`w-full text-left px-2.5 py-2 rounded-lg transition-all duration-200
            ${isSubActive ? 'bg-white/20 text-white shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'}
          `}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`rounded-full transition-all duration-200
                ${isSubActive ? 'w-1.5 h-1.5 bg-white shadow-lg' : 'w-1 h-1 bg-white/60'}
              `}
            />
            <span className={`text-xs truncate ${isSubActive ? 'font-medium' : ''}`}>
              {subItem.label}
            </span>
          </div>
        </button>
      );
    })}
  </div>
)}

                
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          {isExpanded && (
            <div className="p-3 border-t border-white/20">
              <div className="p-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Activity className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-[10px] font-semibold truncate">ระบบพร้อมใช้งาน</p>
                    <p className="text-white/70 text-[10px] truncate">Connected</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}