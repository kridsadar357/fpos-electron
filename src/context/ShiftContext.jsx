import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ShiftContext = createContext();

export const ShiftProvider = ({ children }) => {
    const { user } = useAuth();
    const [currentShift, setCurrentShift] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentShift = async () => {
        if (!user) {
            setCurrentShift(null);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/shifts/current?user_id=${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setCurrentShift(data);
            } else {
                setCurrentShift(null);
            }
        } catch (error) {
            console.error('Error fetching shift:', error);
            setCurrentShift(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentShift();
    }, [user]);

    const openShift = async (startCash) => {
        console.log('Opening shift for user:', user, 'Cash:', startCash);
        if (!user || !user.id) {
            return { success: false, error: 'User not authenticated or missing ID' };
        }
        try {
            const response = await fetch('http://localhost:3001/api/shifts/open', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, start_cash: startCash }),
            });

            if (response.ok) {
                await fetchCurrentShift();
                return { success: true };
            } else {
                const error = await response.json();
                console.error('Open shift failed:', error);
                return { success: false, error: error.error || 'Unknown server error' };
            }
        } catch (error) {
            console.error('Network error opening shift:', error);
            return { success: false, error: error.message };
        }
    };

    const closeShift = async (endCash) => {
        if (!currentShift) return;
        try {
            const response = await fetch('http://localhost:3001/api/shifts/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentShift.id, end_cash: endCash }),
            });

            if (response.ok) {
                setCurrentShift(null);
                return { success: true };
            }
        } catch (error) {
            console.error('Error closing shift:', error);
            return { success: false, error: error.message };
        }
    };

    return (
        <ShiftContext.Provider value={{ currentShift, loading, openShift, closeShift, refreshShift: fetchCurrentShift }}>
            {children}
        </ShiftContext.Provider>
    );
};

export const useShift = () => useContext(ShiftContext);
