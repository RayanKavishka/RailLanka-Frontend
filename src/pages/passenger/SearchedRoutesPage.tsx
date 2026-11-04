import { useEffect, useState } from "react";
import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
import JourneyCard from "../../components/passenger/JourneyCard";
import {
  getAllStations,
  getFilterdRoutesByJourney,
} from "../../services/routeService";
import { TrainFront, ArrowRight, CalendarDays } from "lucide-react";

interface IRoute {
  _id: string;
  routeName: string;
  routeCode: string;
  description?: string;
  estimatedDurationHours: number;
}

interface IStation {
  _id: string;
  stationName: string;
  stationCode: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  isActive: boolean;
}

interface INestedStation {
  station: IStation | null;
  arrivalTime: string;
  departureTime: string;
}

type filteredRouteResponse = {
  route: IRoute;
  stations: INestedStation[];
  journeyDate: Date;
};

export type searchedProps = {
  startStationId: string;
  destinationStationId: string;
  journeyDate: string;
};

// Format minutes as "3h 05m"
const formatMinutes = (totalMinutes: number) => {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

// Work out the duration from "HH:mm" times, falling back to the route's estimate
const getDuration = (
  departureTime: string | undefined,
  arrivalTime: string | undefined,
  fallbackHours: number
) => {
  const parse = (t?: string) => {
    const match = t?.match(/(\d{1,2}):(\d{2})/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  };

  const dep = parse(departureTime);
  const arr = parse(arrivalTime);

  if (dep !== null && arr !== null) {
    let diff = arr - dep;
    if (diff < 0) diff += 24 * 60; // arrives after midnight
    return formatMinutes(diff);
  }

  return formatMinutes(fallbackHours * 60);
};

// Departure time at the given station, taken from ONE route's stop list
const getDepartureTime = (
  stations: INestedStation[],
  stationId: string
): string => {
  const stationObj = stations.find((item) => item.station?._id === stationId);

  return stationObj?.departureTime || "N/A";
};

// Arrival time at the given station, taken from ONE route's stop list
const getArrivalTime = (
  stations: INestedStation[],
  stationId: string
): string => {
  const stationObj = stations.find((item) => item.station?._id === stationId);

  return stationObj?.arrivalTime || "N/A";
};

const SearchedRoutesPage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const startStationId = searchParams.get("startStationId") ?? "";
  const destinationStationId = searchParams.get("destinationStationId") ?? "";
  const journeyDate = searchParams.get("journeyDate") ?? "";

  const [routeStations, setRouteStations] = useState<filteredRouteResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Full station list, used to show station names even when no journeys are found
  const [stations, setStations] = useState<IStation[]>([]);

  useEffect(() => {
    let ignore = false;

    const loadStations = async () => {
      try {
        const res = await getAllStations();
        if (!ignore) setStations(res.data.body);
      } catch (err) {
        console.error("Failed to load stations", err);
      }
    };

    loadStations();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!startStationId || !destinationStationId || !journeyDate) {
      return;
    }

    const getRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getFilterdRoutesByJourney({
          startStationId,
          destinationStationId,
          journeyDate,
        });

        setRouteStations(res.data.body);
      } catch (err) {
        console.error("Failed to load routes", err);
        setError("Something went wrong while loading journeys.");
        setRouteStations([]);
      } finally {
        setLoading(false);
      }
    };

    getRoutes();
  }, [startStationId, destinationStationId, journeyDate]);

  // Redirect AFTER all hooks have been called
  if (!startStationId || !destinationStationId || !journeyDate) {
    return <Navigate to="/passenger" replace />;
  }

  const handleSelectJourney = () => {
    console.log("Journey selected!");
  };

  const formattedDate = new Date(journeyDate).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const getStationNameById = (stationId: string): string => {
    // Full station list works even when no journeys were found
    const known = stations.find((s) => s._id === stationId);
    if (known) return known.stationName;

    // Fallback: names from the search results
    for (const routeStation of routeStations ?? []) {
      const stationObj = routeStation.stations?.find(
        (item) => item.station?._id === stationId
      );

      if (stationObj?.station?.stationName) {
        return stationObj.station.stationName;
      }
    }

    return "Unknown Station";
  };

  const startStationName = getStationNameById(startStationId);
  const desStationName = getStationNameById(destinationStationId);

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F4F6FA]">
      {/* Journey Header */}
      <section className="bg-gradient-to-r from-[#0D1B2A] to-[#1D367A] px-4 py-6 sm:px-6 sm:py-8 md:px-12 md:py-9 lg:px-20">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            {/* Station names wrap onto a second line on narrow screens */}
            <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xl font-bold leading-tight text-white sm:gap-x-4 sm:text-2xl md:text-3xl lg:text-4xl">
              <span className="break-words">{startStationName}</span>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-teal-300 sm:h-6 sm:w-6"
                aria-hidden="true"
              />
              <span className="break-words">{desStationName}</span>
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300 sm:gap-x-6 sm:text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={16}
                  className="shrink-0 text-teal-300"
                  aria-hidden="true"
                />
                {formattedDate}
              </div>

              <div className="flex items-center gap-2">
                <TrainFront
                  size={16}
                  className="shrink-0 text-teal-300"
                  aria-hidden="true"
                />
                {loading
                  ? "Searching journeys..."
                  : `${routeStations?.length ?? 0} Journeys Found`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/passenger", { replace: true })}
            className="w-full shrink-0 rounded-xl border border-white/30 px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 sm:w-auto"
          >
            Back
          </button>
        </div>
      </section>

      <main className="mx-auto w-full min-w-0 max-w-6xl space-y-3 px-4 py-5 sm:space-y-4 sm:px-6 sm:py-6 lg:py-8">
        {/* Loading State */}
        {loading && (
          <div className="rounded-2xl bg-white px-4 py-12 text-center text-sm text-slate-500 sm:px-6 sm:py-16">
            Loading journeys...
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl bg-red-50 px-4 py-4 text-sm text-red-600 sm:px-6"
          >
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && routeStations?.length === 0 && (
          <div className="rounded-2xl bg-white px-4 py-12 text-center sm:px-6 sm:py-16">
            <TrainFront
              className="mx-auto mb-4 text-slate-400"
              size={40}
              aria-hidden="true"
            />

            <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
              No journeys found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              No available journeys found for your selected stations.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading &&
          routeStations?.map((routeStation) => {
            const routeStops = routeStation.stations ?? [];

            const departureTimeOfSelected = getDepartureTime(routeStops, startStationId);
            const arrivalTimeOfSelected = getArrivalTime(routeStops, destinationStationId);

            return (
              <JourneyCard
                key={routeStation.route._id}
                routeName={routeStation.route.routeName}
                routeCode={routeStation.route.routeCode}
                departureTime={departureTimeOfSelected}
                arrivalTime={arrivalTimeOfSelected}
                startStation={startStationName}
                destinationStation={desStationName}
                duration={getDuration(
                  departureTimeOfSelected,
                  arrivalTimeOfSelected,
                  routeStation.route.estimatedDurationHours
                )}
                onSelect={handleSelectJourney}
              />
            );
          })}
      </main>
    </div>
  );
};



export default SearchedRoutesPage;