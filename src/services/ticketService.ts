import api from "./api"


export const getMyTickets = async () => {
    const res = await api.get("/tickets/my");

    return res;
}