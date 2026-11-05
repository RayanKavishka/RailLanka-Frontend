import type { AxiosResponse } from 'axios';
import type { BookingCheckout, BookingRequest } from '../pages/passenger/BookingShared';
import api from './api';

export interface TicketPricesResponse {
    body: {
        firstClsTicketPrice: number;
        secondClsTicketPrice: number;
        thirdClsTicketPrice: number;
    };
}

export interface BookTicketsResponse {
    data: BookingCheckout;
}

export const bookTickets = (
    request: BookingRequest,
): Promise<AxiosResponse<BookTicketsResponse>> => {

    const res = api.post<BookTicketsResponse>('/journeys', { ...request });

    return res;
};

export const getTicketPrices = (params: {
    startStationId: string;
    destinationStationId: string;
}): Promise<AxiosResponse<TicketPricesResponse>> => {

    const res = api.get<TicketPricesResponse>('/journeys', {
        params: {
            startStationId: params.startStationId,
            destinationStationId: params.destinationStationId,
        },
    });

    return res;
};