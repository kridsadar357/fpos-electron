import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaUserPlus, FaEdit, FaTrash, FaUserShield, FaUserSlash, FaUserCheck, FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import UserModal from '../../components/admin/UserModal';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error('ไม่สามารถโหลดข้อมูลผู้ใช้งานได้');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAdd = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งานนี้?')) return;
        try {
            const res = await fetch(`http://localhost:3001/api/users/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success('ลบผู้ใช้งานเรียบร้อยแล้ว');
                fetchUsers();
            } else {
                toast.error('ลบผู้ใช้งานไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            toast.error('เกิดข้อผิดพลาดในการลบผู้ใช้งาน');
        }
    };

    const handleToggleActive = async (user) => {
        try {
            const res = await fetch(`http://localhost:3001/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user, active: !user.active })
            });

            if (res.ok) {
                toast.success(`ผู้ใช้งาน ${user.username} ${!user.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} แล้ว`);
                fetchUsers();
            } else {
                toast.error('อัปเดตสถานะไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Error updating user status:', err);
            toast.error('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
        }
    };

    const handleSave = async (formData) => {
        try {
            const url = editingUser
                ? `http://localhost:3001/api/users/${editingUser.id}`
                : 'http://localhost:3001/api/users';
            const method = editingUser ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingUser ? 'แก้ไขผู้ใช้งานสำเร็จ' : 'เพิ่มผู้ใช้งานสำเร็จ');
                setIsModalOpen(false);
                fetchUsers();
            } else {
                toast.error('บันทึกผู้ใช้งานไม่สำเร็จ');
            }
        } catch (err) {
            console.error('Error saving user:', err);
            toast.error('เกิดข้อผิดพลาดในการบันทึกผู้ใช้งาน');
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <FaUserShield className="mr-3" /> จัดการผู้ใช้งาน (User Management)
                </h1>
                <button
                    onClick={handleAdd}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold flex items-center shadow"
                >
                    <FaUserPlus className="mr-2" /> เพิ่มผู้ใช้งาน
                </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4 font-bold text-gray-600">ชื่อผู้ใช้</th>
                            <th className="p-4 font-bold text-gray-600">ตำแหน่ง</th>
                            <th className="p-4 font-bold text-gray-600 text-center">สถานะ</th>
                            <th className="p-4 font-bold text-gray-600 text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentItems.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-800">{user.username}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full 
                                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'}`}>
                                        {user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.role === 'manager' ? 'ผู้จัดการ' : 'พนักงานขาย'}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleToggleActive(user)}
                                        className={`px-3 py-1 text-xs font-bold rounded-full flex items-center justify-center mx-auto w-24
                                            ${user.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                                    >
                                        {user.active ? <><FaUserCheck className="mr-1" /> ใช้งาน</> : <><FaUserSlash className="mr-1" /> ปิดใช้งาน</>}
                                    </button>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                                        title="แก้ไข"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                                        title="ลบ"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center bg-white rounded-b-xl shadow mt-[-1rem] mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">แสดง</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-600">รายการต่อหน้า</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="หน้าแรก"
                        >
                            <FaAngleDoubleLeft />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="ก่อนหน้า"
                        >
                            <FaChevronLeft />
                        </button>

                        <span className="px-4 font-bold text-gray-600">
                            หน้า {currentPage} จาก {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="ถัดไป"
                        >
                            <FaChevronRight />
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                            title="หน้าสุดท้าย"
                        >
                            <FaAngleDoubleRight />
                        </button>
                    </div>
                </div>
            )}

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                user={editingUser}
            />
        </div>
    );
};

export default Users;
