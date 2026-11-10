import api from './api';

export const register = async ({ fullName, email, password, mobile }: any) => {
    const res = await api.post("/auth/register", {
        fullName,
        email,
        password,
        phone: mobile,
        roles: ["PASSENGER"]
    });

    return res;
}

export const login = async (email: string, password: string) => {
    const res = await api.post("/auth/login", {
        email,
        password
    });

    return res;
}

export const getNewAccessToken = async (refreshToken: string) => {
    const res = await api.post("/auth/access-token", {
        refreshToken
    });

    return res;
}

export const getMyDetails = async () => {
    const res = await api.get("/auth/me");

    return res;
}

export const forgotPassword = async (email: string) => {
    const res = await api.post("/auth/forgot-password", {
        email
    });

    return res;
}

export const verifyOTP = async (email: string, otp: string) => {
    const res = await api.get("/auth/verify-otp", {
        params: {
            email,
            otp
        }
    });

    return res;
}

export const resetPassword = async (email: string, resetToken: string, newPassword: string) => {
    const res = api.post("/auth/reset-password", {
        userEmail: email,
        resetToken,
        newPassword
    });

    return res;
}