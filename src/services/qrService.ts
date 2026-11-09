import api from "./api"

export const scanQR = async (qrToken: string) => {
    const res = await api.get("/qrs/verify", {
        params: {
            qrToken
        }
    });

    return res;
}