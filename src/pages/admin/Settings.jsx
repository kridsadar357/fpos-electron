import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaBuilding, FaBell, FaDatabase, FaTools, FaFileInvoiceDollar, FaUpload, FaDownload, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tax_invoice');
    const [settings, setSettings] = useState({
        company_name: '',
        company_address: '',
        tax_id: '',
        branch_id: '',
        phone: '',
        footer_text: '',
        line_notify_enabled: false,
        line_notify_token: '',
        telegram_notify_enabled: false,
        telegram_bot_token: '',
        telegram_chat_id: '',
        pos_status: 'open' // open, closed
    });
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [restoreFile, setRestoreFile] = useState(null);
    const [restorePassword, setRestorePassword] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/settings');
            if (res.ok) {
                const data = await res.json();
                // Convert string booleans if necessary
                const parsedData = {
                    ...data,
                    line_notify_enabled: data.line_notify_enabled === 'true' || data.line_notify_enabled === true,
                    telegram_notify_enabled: data.telegram_notify_enabled === 'true' || data.telegram_notify_enabled === true,
                };
                setSettings(prev => ({ ...prev, ...parsedData }));
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
            toast.error('ไม่สามารถโหลดการตั้งค่าได้');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        try {
            const res = await fetch('http://localhost:3001/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
            } else {
                throw new Error('Failed to save');
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            toast.error('บันทึกไม่สำเร็จ');
        }
    };

    const handleBackup = async () => {
        const toastId = toast.loading('กำลังสำรองข้อมูล...');
        try {
            const res = await fetch('http://localhost:3001/api/backup');
            if (!res.ok) throw new Error('Backup failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Try to get filename from Content-Disposition header
            const contentDisposition = res.headers.get('Content-Disposition');
            let filename = `backup-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.sql`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch.length === 2)
                    filename = filenameMatch[1];
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('ดาวน์โหลดไฟล์สำรองสำเร็จ', { id: toastId });
        } catch (err) {
            console.error('Backup error:', err);
            toast.error('การสำรองข้อมูลล้มเหลว', { id: toastId });
        }
    };

    const handleRestoreClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setRestoreFile(file);
        setRestorePassword('');
        setShowPasswordModal(true);
        e.target.value = null; // Reset file input
    };

    const confirmRestore = async () => {
        setShowPasswordModal(false);

        if (restorePassword !== 'tar357') {
            toast.error('รหัสผ่านไม่ถูกต้อง');
            setRestoreFile(null);
            return;
        }

        if (!restoreFile) return;

        const formData = new FormData();
        formData.append('file', restoreFile);

        const toastId = toast.loading('กำลังกู้คืนข้อมูล...');

        try {
            const res = await fetch('http://localhost:3001/api/restore', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                toast.success('กู้คืนข้อมูลสำเร็จ', { id: toastId });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                throw new Error('Restore failed');
            }
        } catch (err) {
            console.error('Restore error:', err);
            toast.error('กู้คืนข้อมูลล้มเหลว', { id: toastId });
        } finally {
            setRestoreFile(null);
        }
    };

    const togglePOSStatus = async () => {
        const newStatus = settings.pos_status === 'open' ? 'closed' : 'open';
        setSettings(prev => ({ ...prev, pos_status: newStatus }));

        // Auto-save when toggling
        try {
            await fetch('http://localhost:3001/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...settings, pos_status: newStatus })
            });
            toast.success(newStatus === 'closed' ? 'ปิดระบบ POS แล้ว' : 'เปิดระบบ POS แล้ว');
        } catch (err) {
            toast.error('บันทึกสถานะไม่สำเร็จ');
            // Revert on error
            setSettings(prev => ({ ...prev, pos_status: settings.pos_status }));
        }
    };

    if (loading) return <div className="p-8 text-center">กำลังโหลด...</div>;

    const tabs = [
        { id: 'tax_invoice', label: 'ใบกำกับภาษี (Tax Invoice)', icon: <FaFileInvoiceDollar /> },
        { id: 'notification', label: 'การแจ้งเตือน (Notification)', icon: <FaBell /> },
        { id: 'backup_restore', label: 'สำรองข้อมูล (Backup & Restore)', icon: <FaDatabase /> },
        { id: 'maintenance', label: 'บำรุงรักษา (Maintenance)', icon: <FaTools /> },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans">
            <header className="mb-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaBuilding className="mr-3" /> ตั้งค่า (Settings)
                </h1>
                <button
                    onClick={() => navigate('/menu')}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 font-bold shadow active:scale-95 transition-transform text-sm"
                >
                    <FaArrowLeft className="inline mr-2" /> กลับ (Back)
                </button>
            </header>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-6xl mx-auto flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                    <nav className="flex flex-col h-full">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`p-4 text-left flex items-center transition-colors border-b border-gray-100 ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-600 border-r-4 border-r-blue-600 font-bold'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="mr-3 text-lg">{tab.icon}</span>
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === 'tax_invoice' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">ตั้งค่าใบกำกับภาษี</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-gray-700 font-bold mb-1 text-sm">ชื่อบริษัท / ร้านค้า (Company Name)</label>
                                        <input
                                            type="text"
                                            name="company_name"
                                            value={settings.company_name}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-gray-700 font-bold mb-1 text-sm">ที่อยู่ (Address)</label>
                                        <textarea
                                            name="company_address"
                                            value={settings.company_address}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-bold mb-1 text-sm">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                                        <input
                                            type="text"
                                            name="tax_id"
                                            value={settings.tax_id}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-bold mb-1 text-sm">รหัสสาขา (Branch ID)</label>
                                        <input
                                            type="text"
                                            name="branch_id"
                                            value={settings.branch_id}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="เช่น 00000"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-bold mb-1 text-sm">เบอร์โทรศัพท์ (Phone)</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={settings.phone}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-gray-700 font-bold mb-1 text-sm">ข้อความท้ายใบเสร็จ (Footer Text)</label>
                                        <input
                                            type="text"
                                            name="footer_text"
                                            value={settings.footer_text}
                                            onChange={handleChange}
                                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold shadow active:scale-95 transition-transform flex items-center"
                                    >
                                        <FaSave className="mr-2" /> บันทึก (Save)
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'notification' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">การแจ้งเตือน (Notification)</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Line Notify */}
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-green-600 flex items-center"><FaBell className="mr-2" /> Line Notify</h3>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="line_notify_enabled"
                                                checked={settings.line_notify_enabled}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>
                                    {settings.line_notify_enabled && (
                                        <div>
                                            <label className="block text-gray-700 font-bold mb-1 text-sm">Line Notify Token</label>
                                            <input
                                                type="text" // Changed to text as requested "input for important to use" - usually tokens are kept secret but user asked for input
                                                name="line_notify_token"
                                                value={settings.line_notify_token}
                                                onChange={handleChange}
                                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="Enter Line Notify Token"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Telegram Notify */}
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-lg text-blue-500 flex items-center"><FaBell className="mr-2" /> Telegram Notify</h3>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="telegram_notify_enabled"
                                                checked={settings.telegram_notify_enabled}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    {settings.telegram_notify_enabled && (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-gray-700 font-bold mb-1 text-sm">Telegram Bot Token</label>
                                                <input
                                                    type="text"
                                                    name="telegram_bot_token"
                                                    value={settings.telegram_bot_token}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter Bot Token"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 font-bold mb-1 text-sm">Chat ID</label>
                                                <input
                                                    type="text"
                                                    name="telegram_chat_id"
                                                    value={settings.telegram_chat_id}
                                                    onChange={handleChange}
                                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter Chat ID"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold shadow active:scale-95 transition-transform flex items-center"
                                    >
                                        <FaSave className="mr-2" /> บันทึก (Save)
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'backup_restore' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">สำรองและกู้คืนข้อมูล (Backup & Restore)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Backup */}
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center hover:shadow-md transition-shadow">
                                    <FaDownload className="text-5xl mx-auto mb-4 text-blue-500" />
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">สำรองข้อมูล (Export SQL)</h3>
                                    <p className="text-sm text-gray-600 mb-6">ดาวน์โหลดไฟล์ฐานข้อมูล (.sql) เพื่อเก็บไว้เป็นสำรอง</p>
                                    <button
                                        onClick={handleBackup}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 font-bold shadow transition-transform active:scale-95"
                                    >
                                        ดาวน์โหลดไฟล์สำรอง
                                    </button>
                                </div>

                                {/* Restore */}
                                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 text-center hover:shadow-md transition-shadow">
                                    <FaUpload className="text-5xl mx-auto mb-4 text-orange-500" />
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">กู้คืนข้อมูล (Restore SQL)</h3>
                                    <p className="text-sm text-gray-600 mb-6">อัปโหลดไฟล์ (.sql) เพื่อกู้คืนข้อมูล (ต้องใช้รหัสผ่าน)</p>
                                    <input
                                        type="file"
                                        accept=".sql"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        onClick={handleRestoreClick}
                                        className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 font-bold shadow transition-transform active:scale-95"
                                    >
                                        อัปโหลดและกู้คืน
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">บำรุงรักษา (Maintenance)</h2>
                            <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-red-700 flex items-center">
                                        <FaLock className="mr-2" /> ปิดระบบ POS ชั่วคราว (Close POS)
                                    </h3>
                                    <p className="text-sm text-red-600 mt-1">
                                        เมื่อเปิดใช้งาน พนักงานจะไม่สามารถเข้าใช้งานหน้าขาย (POS) ได้
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.pos_status === 'closed'}
                                        onChange={togglePOSStatus}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                            <div className="mt-4 text-center">
                                <p className="text-gray-500 text-sm">สถานะปัจจุบัน: <span className={`font-bold ${settings.pos_status === 'closed' ? 'text-red-600' : 'text-green-600'}`}>{settings.pos_status === 'closed' ? 'ปิดใช้งาน (Closed)' : 'เปิดใช้งาน (Open)'}</span></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">ยืนยันการกู้คืนข้อมูล</h3>
                        <p className="text-sm text-gray-600 mb-4">กรุณากรอกรหัสผ่านเพื่อยืนยัน (Enter Password)</p>
                        <input
                            type="password"
                            value={restorePassword}
                            onChange={(e) => setRestorePassword(e.target.value)}
                            className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Password"
                            autoFocus
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setRestoreFile(null);
                                }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={confirmRestore}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
                            >
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
