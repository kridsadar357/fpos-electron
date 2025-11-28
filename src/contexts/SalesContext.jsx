import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

const SalesContext = createContext();

export const useSales = () => useContext(SalesContext);

export const SalesProvider = ({ children }) => {
    // Structure: { nozzleId: [ { id: dbId, ...data } ] }
    const [activeSales, setActiveSales] = useState({});
    const [loading, setLoading] = useState(true);

    // Fetch held sales on mount
    useEffect(() => {
        const fetchHeldSales = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/held-sales');
                if (res.ok) {
                    const sales = await res.json();
                    const salesMap = {};
                    sales.forEach(s => {
                        const nozzleId = s.nozzle_id;
                        if (!salesMap[nozzleId]) salesMap[nozzleId] = [];
                        // Combine db id with sale data
                        salesMap[nozzleId].push({ id: s.id, ...s.sale_data });
                    });
                    setActiveSales(salesMap);
                }
            } catch (err) {
                console.error('Error fetching held sales:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHeldSales();
    }, []);

    // Get all sales for a nozzle
    const getSales = useCallback((nozzleId) => {
        return activeSales[nozzleId] || [];
    }, [activeSales]);

    // Get a specific sale
    const getSale = useCallback((nozzleId, saleId) => {
        const sales = activeSales[nozzleId] || [];
        return sales.find(s => s.id === saleId) || null;
    }, [activeSales]);

    // Add a new sale for a nozzle
    const addSale = useCallback(async (nozzleId, initialData = {}) => {
        try {
            // Optimistic update not easy here because we need DB ID.
            // So we wait for DB.
            const res = await fetch('http://localhost:3001/api/held-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nozzle_id: nozzleId, sale_data: initialData })
            });

            if (res.ok) {
                const { id } = await res.json();
                setActiveSales(prev => {
                    const sales = prev[nozzleId] || [];
                    if (sales.length >= 5) return prev; // Limit 5 check should be here or backend?
                    // If backend doesn't enforce, frontend does.
                    return {
                        ...prev,
                        [nozzleId]: [...sales, { id, ...initialData }]
                    };
                });
                return id;
            }
        } catch (err) {
            console.error('Error adding sale:', err);
            toast.error('ไม่สามารถสร้างรายการใหม่ได้');
        }
        return null;
    }, []);

    // Update a specific sale
    const updateSale = useCallback(async (nozzleId, saleId, data) => {
        // We need to merge existing data with new data to save complete object
        // But here 'data' might be partial.
        // Let's find current state first.
        setActiveSales(prev => {
            const sales = prev[nozzleId] || [];
            const saleIndex = sales.findIndex(s => s.id === saleId);
            if (saleIndex === -1) return prev;

            const updatedSale = { ...sales[saleIndex], ...data };

            // Fire and forget update to DB (or await if critical)
            fetch('http://localhost:3001/api/held-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: saleId, nozzle_id: nozzleId, sale_data: updatedSale })
            }).catch(err => console.error('Error updating sale:', err));

            const newSales = [...sales];
            newSales[saleIndex] = updatedSale;

            return {
                ...prev,
                [nozzleId]: newSales
            };
        });
    }, []);

    // Clear a specific sale
    const clearSale = useCallback(async (nozzleId, saleId) => {
        try {
            await fetch(`http://localhost:3001/api/held-sales/${saleId}`, { method: 'DELETE' });

            setActiveSales(prev => {
                const sales = prev[nozzleId] || [];
                const filteredSales = sales.filter(s => s.id !== saleId);
                if (filteredSales.length === 0) {
                    const newState = { ...prev };
                    delete newState[nozzleId];
                    return newState;
                }
                return {
                    ...prev,
                    [nozzleId]: filteredSales
                };
            });
        } catch (err) {
            console.error('Error clearing sale:', err);
        }
    }, []);

    return (
        <SalesContext.Provider value={{ activeSales, getSales, getSale, addSale, updateSale, clearSale, loading }}>
            {children}
        </SalesContext.Provider>
    );
};
