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