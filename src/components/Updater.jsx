import React, { useEffect } from 'react';
import toast from 'react-hot-toast';

const Updater = () => {
    useEffect(() => {
        if (!window.require) return;
        const { ipcRenderer } = window.require('electron');

        const handleUpdateStatus = (event, data) => {
            console.log('Update status:', data);

            switch (data.status) {
                case 'available':
                    toast((t) => (
                        <div className="flex flex-col">
                            <span className="font-bold">มีอัปเดตเวอร์ชันใหม่!</span>
                            <span className="text-sm text-gray-600 mb-2">เวอร์ชัน {data.info.version} พร้อมให้ดาวน์โหลด</span>
                            <button
                                onClick={() => {
                                    ipcRenderer.send('download_update');
                                    toast.dismiss(t.id);
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                                ดาวน์โหลด
                            </button>
                        </div>
                    ), { duration: 10000, icon: '🚀' });
                    break;

                case 'downloading':
                    // Optional: Show progress (could be noisy if too frequent)
                    // You might want to use a persistent toast ID to update progress
                    break;

                case 'downloaded':
                    toast((t) => (
                        <div className="flex flex-col">
                            <span className="font-bold">ดาวน์โหลดเสร็จสิ้น</span>
                            <span className="text-sm text-gray-600 mb-2">รีสตาร์ทเพื่อติดตั้งอัปเดต</span>
                            <button
                                onClick={() => {
                                    ipcRenderer.send('restart_app');
                                    toast.dismiss(t.id);
                                }}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                                รีสตาร์ทเดี๋ยวนี้
                            </button>
                        </div>
                    ), { duration: Infinity, icon: '✅' });
                    break;

                case 'error':
                    console.error('Update error:', data.error);
                    // toast.error('เกิดข้อผิดพลาดในการอัปเดต');
                    break;

                default:
                    break;
            }
        };

        ipcRenderer.on('update_status', handleUpdateStatus);

        // Check for updates on mount
        ipcRenderer.send('check_for_update');

        return () => {
            ipcRenderer.removeListener('update_status', handleUpdateStatus);
        };
    }, []);

    return null; // This component doesn't render anything visible itself
};

export default Updater;
