import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const BackofficeLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isReportsOpen, setIsReportsOpen] = useState(false);
    const [isDailyReportsOpen, setIsDailyReportsOpen] = useState(false);
    const [version, setVersion] = useState('');

    React.useEffect(() => {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('get_version').then(ver => setVersion(ver));
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-blue-900 text-white flex flex-col shadow-xl transition-all duration-300 overflow-hidden`}>
                <div className="p-6 border-b border-blue-800 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold whitespace-nowrap">Fuel POS Admin</h1>
                        <p className="text-sm text-blue-300 mt-1 whitespace-nowrap">
                            Backoffice System {version && <span className="text-xs bg-blue-800 px-2 py-0.5 rounded-full text-blue-200">v{version}</span>}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto whitespace-nowrap [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-800">
                    <Link to="/admin" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        📊 Dashboard
                    </Link>

                    <div className="pt-4 pb-2 text-xs font-bold text-blue-300 uppercase">Management</div>
                    <Link to="/admin/products" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/products') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        ⛽ สินค้า
                    </Link>
                    <Link to="/admin/users" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/users') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        👥 ผู้ใช้งาน
                    </Link>
                    <Link to="/admin/dispensers" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/dispensers') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        🔌 หัวจ่าย
                    </Link>
                    <Link to="/admin/promotions" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/promotions') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        🏷️ โปรโมชั่น
                    </Link>
                    <Link to="/admin/settings" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/settings') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        ⚙️ ตั้งค่า
                    </Link>

                    <div className="pt-4 pb-2 text-xs font-bold text-blue-300 uppercase">Inventory</div>
                    <Link to="/admin/tanks" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/tanks') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        🛢️ ถังน้ำมัน
                    </Link>
                    <Link to="/admin/suppliers" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/suppliers') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        🏭 ผู้จำหน่าย
                    </Link>
                    <Link to="/admin/fuel-import" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/fuel-import') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        🚛 นำเข้าน้ำมัน
                    </Link>

                    <div className="pt-4 pb-2 text-xs font-bold text-blue-300 uppercase">Accounting</div>
                    <Link to="/admin/accounting/check-balance" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/accounting/check-balance') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        💰 ตรวจสอบยอด
                    </Link>
                    <Link to="/admin/accounting/close-day" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/accounting/close-day') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        🌙 ปิดวัน
                    </Link>
                    <Link to="/admin/accounting/income-expense" className={`block px-4 py-2 rounded transition-colors ${isActive('/admin/accounting/income-expense') ? 'bg-blue-700' : 'hover:bg-blue-800'}`}>
                        📝 รายรับ-รายจ่าย
                    </Link>

                    <div className="pt-4 pb-2 text-xs font-bold text-blue-300 uppercase">Reports</div>
                    <button
                        onClick={() => setIsReportsOpen(!isReportsOpen)}
                        className={`w-full text-left px-4 py-2 rounded transition-colors flex justify-between items-center ${isActive('/admin/reports/shift') || isReportsOpen ? 'bg-blue-800' : 'hover:bg-blue-800'}`}
                    >
                        <span>📋 รายงานปิดกะ</span>
                        {isReportsOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>

                    {isReportsOpen && (
                        <div className="bg-blue-950 rounded-lg mt-1 overflow-hidden">
                            <Link to="/admin/reports/sales-by-nozzle" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/sales-by-nozzle') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายตามหัวจ่าย
                            </Link>
                            <Link to="/admin/reports/sales-by-fuel-type" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/sales-by-fuel-type') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายตามชนิดน้ำมัน
                            </Link>
                            <Link to="/admin/reports/sales-by-goods" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/sales-by-goods') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายสินค้าทั่วไป
                            </Link>
                            <Link to="/admin/reports/sales-cash" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/sales-cash') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายเงินสด
                            </Link>
                            <Link to="/admin/reports/sales-transfer" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/sales-transfer') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายเงินโอน
                            </Link>
                            <Link to="/admin/reports/sales-credit" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/sales-credit') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายเงินเชื่อ
                            </Link>
                            <Link to="/admin/reports/sales-by-meter" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/sales-by-meter') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายตามมิเตอร์
                            </Link>
                        </div>
                    )}
                    <button
                        onClick={() => setIsDailyReportsOpen(!isDailyReportsOpen)}
                        className={`w-full text-left px-4 py-2 rounded transition-colors flex justify-between items-center ${isActive('/admin/reports/daily') || isDailyReportsOpen ? 'bg-blue-800' : 'hover:bg-blue-800'}`}
                    >
                        <span>📅 รายงานปิดวัน</span>
                        {isDailyReportsOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>

                    {isDailyReportsOpen && (
                        <div className="bg-blue-950 rounded-lg mt-1 overflow-hidden">
                            <Link to="/admin/reports/daily/sales-by-nozzle" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/daily/sales-by-nozzle') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายตามหัวจ่าย
                            </Link>
                            <Link to="/admin/reports/daily/sales-by-fuel-type" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/daily/sales-by-fuel-type') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายตามชนิดน้ำมัน
                            </Link>
                            <Link to="/admin/reports/daily/sales-by-goods" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/daily/sales-by-goods') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายสินค้าทั่วไป
                            </Link>
                            <Link to="/admin/reports/daily/sales-cash" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/daily/sales-cash') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายเงินสด
                            </Link>
                            <Link to="/admin/reports/daily/sales-transfer" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/daily/sales-transfer') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายเงินโอน
                            </Link>
                            <Link to="/admin/reports/daily/sales-credit" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/daily/sales-credit') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายเงินเชื่อ
                            </Link>
                            <Link to="/admin/reports/daily/sales-by-meter" className={`block px-8 py-2 text-sm transition-colors ${isActive('/admin/reports/daily/sales-by-meter') ? 'text-white font-bold' : 'text-blue-300 hover:text-white'}`}>
                                - ยอดขายตามมิเตอร์
                            </Link>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-blue-800 whitespace-nowrap">
                    <div className="mb-4 px-4">
                        <p className="text-sm text-blue-300">เข้าสู่ระบบโดย</p>
                        <p className="font-bold truncate">{user?.username}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors"
                    >
                        ออกจากระบบ
                    </button>
                    <Link to="/" className="block text-center text-blue-300 hover:text-white mt-4 text-sm">
                        ← กลับไปหน้าขาย
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col">
                <div className="bg-white shadow p-4 flex items-center">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-gray-600 hover:text-blue-900 focus:outline-none"
                    >
                        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                    <h2 className="ml-4 text-xl font-semibold text-gray-800">
                        {/* Breadcrumb or Page Title could go here */}
                        Admin Panel
                    </h2>
                </div>
                <div className="p-8 flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default BackofficeLayout;
