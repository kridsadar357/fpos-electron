import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import CloseShiftModal from '../components/CloseShiftModal';
import toast from 'react-hot-toast';

const Menu = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { closeShift } = useShift();
    const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);

    const handleOpenDrawer = () => {
        // Mock function to open cash drawer
        console.log('Opening cash drawer...');
        // In a real app, this would call an API or Electron IPC
        toast.success('ลิ้นชักเก็บเงินเปิดแล้ว (Mock)');
    };

    const handleCloseShift = async (endCash) => {
        const result = await closeShift(endCash);
        if (result.success) {
            setIsCloseShiftModalOpen(false);
            toast.success('ปิดกะสำเร็จ (Shift Closed)');
            navigate('/'); // Redirect to POS/Login after closing
        } else {
            toast.error('ปิดกะไม่สำเร็จ (Failed to close shift): ' + result.error);
        }
    };

    const menuItems = [
        { label: 'ระบบจัดการ (Backoffice)', path: '/admin', role: ['admin', 'manager'], color: 'bg-blue-600' },
        { label: 'จัดการกะ (Shift)', path: '/shift', role: ['admin', 'manager', 'cashier'], color: 'bg-green-600' },
        { label: 'ดูการขาย (View Sales)', path: '/sales/history', role: ['admin', 'manager', 'cashier'], color: 'bg-indigo-500' },
        { label: 'ใบเสร็จรับเงิน (Receipt)', path: '/receipts', role: ['admin', 'manager', 'cashier'], color: 'bg-teal-500' },
        { label: 'ใบกำกับภาษี (Tax Invoice)', path: '/tax-invoice', role: ['admin', 'manager', 'cashier'], color: 'bg-orange-500' },
        { label: 'เปิดเก็บเงิน (Open Drawer)', action: handleOpenDrawer, role: ['admin', 'manager', 'cashier'], color: 'bg-yellow-500' },
        { label: 'ปิดกะ (Close Shift)', action: () => setIsCloseShiftModalOpen(true), role: ['admin', 'manager', 'cashier'], color: 'bg-red-500' },
        { label: 'ตั้งค่า (Settings)', path: '/admin/settings', role: ['admin'], color: 'bg-gray-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <header className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-blue-800">เมนู (Menu)</h1>
                <button
                    onClick={() => navigate('/')}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 font-bold shadow active:scale-95 transition-transform"
                >
                    กลับ (Back)
                </button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {menuItems.map((item, index) => {
                    if (item.role && !item.role.includes(user?.role)) return null;
                    return (
                        <button
                            key={index}
                            onClick={() => item.action ? item.action() : navigate(item.path)}
                            className={`${item.color} text-white p-8 rounded-lg shadow-lg hover:opacity-90 active:scale-95 transition-all text-2xl font-bold flex items-center justify-center`}
                        >
                            {item.label}
                        </button>
                    );
                })}
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="bg-red-700 text-white p-8 rounded-lg shadow-lg hover:opacity-90 active:scale-95 transition-all text-2xl font-bold flex items-center justify-center"
                >
                    ออกจากระบบ (Logout)
                </button>
            </div>

            <CloseShiftModal
                isOpen={isCloseShiftModalOpen}
                onClose={() => setIsCloseShiftModalOpen(false)}
                onConfirm={handleCloseShift}
            />
        </div>
    );
};

export default Menu;
