import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ChevronRight, Fuel, AlertCircle, Delete } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeField, setActiveField] = useState('password'); // 'username' or 'password'
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน (Please enter username and password)');
            return;
        }

        const user = await login(username, password);
        if (user) {
            if (['admin', 'manager'].includes(user.role)) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (Invalid username or password)');
        }
    };

    const handleNumpadInput = (key) => {
        if (activeField === 'username') {
            setUsername(prev => prev + key);
        } else {
            setPassword(prev => prev + key);
        }
    };

    const handleBackspace = () => {
        if (activeField === 'username') {
            setUsername(prev => prev.slice(0, -1));
        } else {
            setPassword(prev => prev.slice(0, -1));
        }
    };

    const handleClear = () => {
        if (activeField === 'username') {
            setUsername('');
        } else {
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen flex font-sans bg-gray-100">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 to-slate-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="z-10 text-center">
                    <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform -rotate-6">
                        <Fuel size={48} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Fuel POS</h1>
                    <p className="text-xl text-blue-200 font-light tracking-wide">Professional Station Management System</p>
                    <div className="mt-12 flex space-x-4 justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
                <div className="absolute bottom-8 text-sm text-blue-400 opacity-60">
                    © 2025 Fuel POS System. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">ยินดีต้อนรับ (Welcome)</h2>
                        <p className="text-gray-500">กรุณาเข้าสู่ระบบเพื่อเริ่มงาน (Please login to start)</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm flex items-center animate-shake">
                            <AlertCircle className="mr-2" size={20} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ (Username)</label>
                            <div className={`relative flex items-center border-2 rounded-xl overflow-hidden transition-colors ${activeField === 'username' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                                <div className="pl-4 text-gray-400">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    className="w-full p-4 outline-none text-lg bg-transparent"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setActiveField('username')}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน (Password)</label>
                            <div className={`relative flex items-center border-2 rounded-xl overflow-hidden transition-colors ${activeField === 'password' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'}`}>
                                <div className="pl-4 text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    className="w-full p-4 outline-none text-lg bg-transparent"
                                    placeholder="Enter PIN / Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setActiveField('password')}
                                />
                            </div>
                        </div>

                        {/* Numpad for Touchscreen */}
                        <div className="grid grid-cols-3 gap-3 mt-6 mb-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => handleNumpadInput(num.toString())}
                                    className="h-14 bg-gray-50 rounded-lg border border-gray-200 text-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:bg-blue-100 transition-all shadow-sm"
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={handleClear}
                                className="h-14 bg-red-50 rounded-lg border border-red-100 text-red-600 font-bold hover:bg-red-100 transition-all"
                            >
                                C
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNumpadInput('0')}
                                className="h-14 bg-gray-50 rounded-lg border border-gray-200 text-xl font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:bg-blue-100 transition-all shadow-sm"
                            >
                                0
                            </button>
                            <button
                                type="button"
                                onClick={handleBackspace}
                                className="h-14 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center"
                            >
                                <Delete size={24} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform active:scale-[0.99] flex items-center justify-center text-lg"
                        >
                            เข้าสู่ระบบ (Login)
                            <ChevronRight className="ml-2" size={20} />
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">System Version 1.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
