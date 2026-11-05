import type { TicketConfirmation } from "../pages/passenger/TicketConfirmationPage";
import api from "./api";


export const fetchTicketConfirmation = async (paymentId: string): Promise<TicketConfirmation> => {
    const res = await api.get(`/payments/${paymentId}/ticket`);
    return res.data.body;
};