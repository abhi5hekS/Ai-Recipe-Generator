import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL
});

const getRequest = async (url) => {
    try {
        const token = localStorage.getItem('token');

        const response = await api.get(url, {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        });

        return response.data;
    } catch (error) {
        handleError(error);
    }
};

const postRequest = async (url, data) => {
    try {
        const token = localStorage.getItem('token');

        const response = await api.post(url, data, {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        });

        return response.data;
    } catch (error) {
        handleError(error);
    }
};


const patchRequest = async (url, data) => {
    try {
        const token = localStorage.getItem('token');

        const response = await api.patch(url, data, {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        });

        return response.data;
    } catch (error) {
        handleError(error);
    }
};

const deleteRequest = async (url) => {
    try {
        const token = localStorage.getItem('token');

        const response = await api.delete(url, {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        });

        return response.data;
    } catch (error) {
        handleError(error);
    }
};

const handleError = (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    } else {
        console.error(error);
    }
};

export default {
    getRequest,
    postRequest,
    patchRequest,
    deleteRequest
};