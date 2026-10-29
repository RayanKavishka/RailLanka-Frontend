import api from "./api";


export type StationOption = { id: string; name: string };
 
/** One entry of the `stations` array sent to / received from the backend. */
export type RouteStop = {
  station: string; // station _id
  arrivalTime: string; // HH:mm (24h)
  departureTime: string; // HH:mm (24h)
  stationName?: string; // only present when the API populated the station
};
 
export type RouteRecord = {
  routeId: string;
  routeName: string;
  routeCode: string;
  description: string;
  estimatedDurationHours: number;
  stations: RouteStop[];
  isActive: boolean;
};
 
/** Matches IRouteRequest on the backend. */
export type RouteRequest = {
  routeId?: string;
  routeName: string;
  routeCode: string;
  description: string;
  estimatedDurationHours: number;
  stations: { station: string; arrivalTime: string; departureTime: string }[];
};

// ===========================================================================================

export const addRoute = async (route: RouteRequest) => {
    const res = await api.post("/routes", {
        routeName: route.routeName,
        routeCode: route.routeCode,
        description: route.description,
        estimatedDurationHours: route.estimatedDurationHours,
        stations: route.stations
    });

    return res;
}

export const updateRoute = async (route: RouteRequest) => {
    const res = await api.put("/routes", {
        routeId: route.routeId,
        routeName: route.routeName,
        routeCode: route.routeCode,
        description: route.description,
        estimatedDurationHours: route.estimatedDurationHours,
        stations: route.stations
    });

    return res;
}

export const inactivateRoute = async (routeId: RouteRecord["routeId"]) => {
    const res = await api.patch(`/routes/${routeId}`);

    return res;
}

export const getAllRoutes = async () => {
    const res = await api.get("/routes");

    return res;
}

export const getAllStations = async () => {
    const res = await api.get("/stations");

    return res;
}