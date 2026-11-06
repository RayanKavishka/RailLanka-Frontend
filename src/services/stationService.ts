import type { IStation } from "../pages/admin/StationsPage";
import api from "./api";

export const saveStation = async (data: IStation) => {
    const res = api.post("/stations", data);

    return res;
}

export const setStatusAsInactive = (stationId: string) => {
    const res = api.patch(`/stations/${stationId}/status`);

    return res;
}