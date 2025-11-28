import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ShiftProvider } from './context/ShiftContext';
import { SalesProvider } from './contexts/SalesContext';
import ProtectedRoute from './components/ProtectedRoute';
import Updater from './components/Updater';
import Login from './pages/Login';
import POS from './pages/POS';
import Sales from './pages/Sales';
import SalesHistory from './pages/SalesHistory';
import Receipts from './pages/Receipts';
import TaxInvoice from './pages/TaxInvoice';
import Menu from './pages/Menu';
import Shift from './pages/Shift';
import SetupWizard from './pages/SetupWizard';
import BackofficeLayout from './layouts/BackofficeLayout';
import RoleRoute from './components/RoleRoute';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';
import Dispensers from './pages/admin/Dispensers';
import Reports from './pages/admin/Reports';
import Promotions from './pages/admin/Promotions';
import Settings from './pages/admin/Settings';
import Suppliers from './pages/admin/Suppliers';
import Tanks from './pages/admin/Tanks';
import FuelImport from './pages/admin/FuelImport';
import CheckBalance from './pages/admin/accounting/CheckBalance';
import CloseDay from './pages/admin/accounting/CloseDay';
import IncomeExpense from './pages/admin/accounting/IncomeExpense';
import ShiftReports from './pages/admin/reports/ShiftReports';
import DailyReports from './pages/admin/reports/DailyReports';
import SalesByNozzle from './pages/admin/reports/SalesByNozzle';
import SalesByFuelType from './pages/admin/reports/SalesByFuelType';
import SalesByGoods from './pages/admin/reports/SalesByGoods';
import SalesByPayment from './pages/admin/reports/SalesByPayment';
import SalesByMeter from './pages/admin/reports/SalesByMeter';





function App() {
  const [configured, setConfigured] = React.useState(null);

  React.useEffect(() => {
    fetch('http://localhost:3001/api/setup/check')
      .then(res => res.json())
      .then(data => setConfigured(data.configured))
      .catch(() => setConfigured(false));
  }, []);

  if (configured === null) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <AuthProvider>
      <ShiftProvider>
        <SalesProvider>
          <Router>
            <Routes>
              {!configured && <Route path="*" element={<SetupWizard />} />}
              <Route path="/setup" element={<SetupWizard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
              <Route path="/shift" element={<ProtectedRoute><Shift /></ProtectedRoute>} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <POS />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales/history"
                element={
                  <ProtectedRoute>
                    <SalesHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receipts"
                element={
                  <ProtectedRoute>
                    <Receipts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tax-invoice"
                element={
                  <ProtectedRoute>
                    <TaxInvoice />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales/:nozzleId/:saleId"
                element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sales/:nozzleId"
                element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                }
              />


              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <RoleRoute roles={['admin', 'manager']}>
                    <BackofficeLayout />
                  </RoleRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="users" element={<Users />} />
                <Route path="dispensers" element={<Dispensers />} />
                <Route path="tanks" element={<Tanks />} />
                <Route path="reports" element={<Reports />} />
                <Route path="promotions" element={<Promotions />} />
                <Route path="settings" element={<Settings />} />

                {/* Inventory */}
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="fuel-import" element={<FuelImport />} />

                {/* Accounting */}
                <Route path="accounting/check-balance" element={<CheckBalance />} />
                <Route path="accounting/close-day" element={<CloseDay />} />
                <Route path="accounting/income-expense" element={<IncomeExpense />} />

                {/* Reports */}
                <Route path="reports/shift" element={<ShiftReports />} />
                <Route path="reports/daily" element={<DailyReports />} />

                {/* Shift Reports */}
                <Route path="reports/sales-by-nozzle" element={<SalesByNozzle />} />
                <Route path="reports/sales-by-fuel-type" element={<SalesByFuelType />} />
                <Route path="reports/sales-by-goods" element={<SalesByGoods />} />
                <Route path="reports/sales-cash" element={<SalesByPayment />} />
                <Route path="reports/sales-transfer" element={<SalesByPayment />} />
                <Route path="reports/sales-credit" element={<SalesByPayment />} />
                <Route path="reports/sales-by-meter" element={<SalesByMeter />} />

                {/* Daily Reports */}
                <Route path="reports/daily/sales-by-nozzle" element={<SalesByNozzle />} />
                <Route path="reports/daily/sales-by-fuel-type" element={<SalesByFuelType />} />
                <Route path="reports/daily/sales-by-goods" element={<SalesByGoods />} />
                <Route path="reports/daily/sales-cash" element={<SalesByPayment />} />
                <Route path="reports/daily/sales-transfer" element={<SalesByPayment />} />
                <Route path="reports/daily/sales-credit" element={<SalesByPayment />} />
                <Route path="reports/daily/sales-by-meter" element={<SalesByMeter />} />
              </Route>
            </Routes>
          </Router>
        </SalesProvider>
      </ShiftProvider>

      <Updater />
      <Toaster />
    </AuthProvider >
  );
}

export default App;
