const API_BASE = 'http://localhost:5000/api';

// Helper function to handle standard JSON fetch responses
const handleResponse = async (res) => {
    if (!res.ok) {
        let errMessage = 'API Request Failed';
        try {
            const errData = await res.json();
            errMessage = errData.error || errMessage;
        } catch (e) {}
        throw new Error(errMessage);
    }
    return res.json();
};

export const authAPI = {
    login: (credentials) => fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    }).then(handleResponse)
};

export const vehiclesAPI = {
    getAll: () => fetch(`${API_BASE}/vehicles`).then(handleResponse),
    create: (data) => fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(handleResponse)
};

export const driversAPI = {
    getAll: () => fetch(`${API_BASE}/drivers`).then(handleResponse),
    create: (data) => fetch(`${API_BASE}/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(handleResponse)
};

export const tripsAPI = {
    getAll: () => fetch(`${API_BASE}/trips`).then(handleResponse),
    dispatch: (tripData) => fetch(`${API_BASE}/trips/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripData)
    }).then(handleResponse),
    complete: (tripId, data) => fetch(`${API_BASE}/trips/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, ...data })
    }).then(handleResponse),
    cancel: (tripId) => fetch(`${API_BASE}/trips/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId })
    }).then(handleResponse)
};

export const maintenanceAPI = {
    create: (data) => fetch(`${API_BASE}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(handleResponse),
    close: (logId) => fetch(`${API_BASE}/maintenance/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId })
    }).then(handleResponse)
};

export const reportsAPI = {
    getAnalytics: () => fetch(`${API_BASE}/reports`).then(handleResponse)
};
