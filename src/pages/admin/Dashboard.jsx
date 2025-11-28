import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp,
    Users,
    CreditCard,
    Activity,
    DollarSign,
    Droplets,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const today = new Date().toISOString().split('T')[0];

                // 1. Fetch Daily Summary
                const summaryRes = await fetch(`http://localhost:3001/api/daily-summary?date=${today}`);
                const summaryData = await summaryRes.json();
                setSummary(summaryData);

                // 2. Fetch Sales Trend (Last 7 Days)
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);

                const reportRes = await fetch(`http://localhost:3001/api/reports/daily?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`);
                const reportData = await reportRes.json();

                // Format for chart
                const formattedSalesData = reportData.map(item => ({
                    name: new Date(item.date).toLocaleDateString('th-TH', { weekday: 'short' }),
                    sales: parseFloat(item.total_sales),
                    cash: parseFloat(item.cash_sales)
                }));
                setSalesData(formattedSalesData);

                // 3. Fetch Recent Transactions
                const txRes = await fetch('http://localhost:3001/api/transactions?limit=5');
                const txData = await txRes.json();
                setRecentTransactions(txData.data);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">กำลังโหลดข้อมูล (Loading Dashboard)...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const paymentData = [
        { name: 'เงินสด (Cash)', value: parseFloat(summary?.cash_sales || 0) },
        { name: 'เงินโอน (Transfer)', value: parseFloat(summary?.transfer_sales || 0) },
        { name: 'เครดิต (Credit)', value: parseFloat(summary?.credit_sales || 0) },
    ].filter(item => item.value > 0);

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">ภาพรวมระบบ (Dashboard Overview)</h1>
                <div className="text-sm text-gray-500">
                    อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="ยอดขายรวม (Total Sales)"
                    value={`฿${summary?.total_sales?.toLocaleString()}`}
                    icon={<DollarSign className="w-6 h-6 text-white" />}
                    color="bg-blue-500"
                    trend="+12.5%"
                />
                <SummaryCard
                    title="กำไรสุทธิ (Net Income)"
                    value={`฿${summary?.net_income?.toLocaleString()}`}
                    icon={<TrendingUp className="w-6 h-6 text-white" />}
                    color="bg-green-500"
                    trend="+8.2%"
                />
                <SummaryCard
                    title="จำนวนรายการ (Transactions)"
                    value={recentTransactions.length > 0 ? "มีการเคลื่อนไหว" : "เงียบเหงา"}
                    icon={<Activity className="w-6 h-6 text-white" />}
                    color="bg-purple-500"
                    subtext="สถานะเรียลไทม์"
                />
                <SummaryCard
                    title="ค่าใช้จ่าย (Expenses)"
                    value={`฿${summary?.total_expenses?.toLocaleString()}`}
                    icon={<CreditCard className="w-6 h-6 text-white" />}
                    color="bg-red-500"
                    trend="-2.4%"
                    trendDown={true}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trend Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">แนวโน้มยอดขายรายสัปดาห์ (Weekly Sales Trend)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Distribution Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ช่องทางการชำระเงิน (Payment Methods)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">รายการล่าสุด (Recent Transactions)</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                            <tr>
                                <th className="p-4">เวลา (Time)</th>
                                <th className="p-4">สินค้า (Product)</th>
                                <th className="p-4">จำนวนเงิน (Amount)</th>
                                <th className="p-4">ชำระโดย (Payment)</th>
                                <th className="p-4">สถานะ (Status)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-gray-600">
                                        {new Date(tx.created_at).toLocaleTimeString('th-TH')}
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{tx.product_name || 'Unknown'}</td>
                                    <td className="p-4 text-gray-800">฿{parseFloat(tx.amount).toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${tx.payment_type === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                                        `}>
                                            {tx.payment_type === 'cash' ? 'เงินสด (Cash)' : 'เงินโอน (Transfer)'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-green-600 text-sm flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            สำเร็จ (Completed)
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">
                                        ไม่พบรายการล่าสุด (No recent transactions found)
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, icon, color, trend, trendDown, subtext }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h4 className="text-2xl font-bold text-gray-800">{value}</h4>
            {(trend || subtext) && (
                <div className={`flex items-center mt-2 text-sm ${trendDown ? 'text-red-500' : 'text-green-500'}`}>
                    {trend && (
                        <>
                            {trendDown ? <ArrowDownRight className="w-4 h-4 mr-1" /> : <ArrowUpRight className="w-4 h-4 mr-1" />}
                            <span className="font-medium">{trend}</span>
                            <span className="text-gray-400 ml-1 font-normal">เทียบกับเมื่อวาน</span>
                        </>
                    )}
                    {subtext && <span className="text-gray-400">{subtext}</span>}
                </div>
            )}
        </div>
        <div className={`p-3 rounded-lg ${color} shadow-lg shadow-opacity-20`}>
            {icon}
        </div>
    </div>
);

export default Dashboard;
