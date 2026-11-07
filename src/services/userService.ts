import type { IUser } from "../context/AuthContext";
import type { UserRoles } from "../pages/admin/AdminsPage";
import api from "./api"

export const saveUser = async (user: IUser) => {
    const res = await api.post("/users", user);

    return res;
}

export const updateUser = async (user: IUser) => {
    const res = await api.put("/users", user);

    return res;
}

export const getUserById = async (userId: string) => {
    const res = await api.get(`/users/${userId}`);

    return res;
}

export const updateUserStatus = async (userId: string) => {
    const res = await api.patch(`/users/${userId}`);

    return res;
}

export const getAllUsersByRole = async (role: UserRoles) => {
    const res = await api.get("/users", {
        params: {
            role
        }
    });

    return res;
}