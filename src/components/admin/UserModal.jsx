import React, { useState, useEffect } from 'react';

const UserModal = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'cashier',
        active: true
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                password: '', // Don't show password
                role: user.role,
                active: user.active !== undefined ? Boolean(user.active) : true
            });
        } else {
            setFormData({
                username: '',
                password: '',
                role: 'cashier',
                active: true
            });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4 text-gray-800">{user ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">ชื่อผู้ใช้ (Username)</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {user ? 'รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'รหัสผ่าน (Password)'}
                        </label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!user}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">ตำแหน่ง (Role)</label>
                        <select
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="cashier">พนักงานขาย (Cashier)</option>
                            <option value="manager">ผู้จัดการ (Manager)</option>
                            <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                        </select>
                    </div>
                    <div className="mb-6 flex items-center">
                        <input
                            type="checkbox"
                            id="active"
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        />
                        <label htmlFor="active" className="text-gray-700 text-sm font-bold">ใช้งานได้ (Active)</label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 font-bold"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold"
                        >
                            บันทึก
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
