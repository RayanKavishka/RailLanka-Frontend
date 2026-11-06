import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup
} from "react-leaflet";
import type { IStation } from "./StationsPage";
import { setStatusAsInactive } from "../../services/stationService";
import { toast } from "sonner";


interface StationMapProps {
    stations: IStation[];
    onStationUpdated: () => void;
}

const StationMap = ({ stations, onStationUpdated }: StationMapProps) => {

    const validStations = stations.filter(
        station =>
            Number.isFinite(station.location.latitude) &&
            Number.isFinite(station.location.longitude) &&
            station.location.latitude >= -90 &&
            station.location.latitude <= 90 &&
            station.location.longitude >= -180 &&
            station.location.longitude <= 180
    );


    const handleRedirectToMap = (station: IStation) => {
        
        const { latitude, longitude } = station.location;

        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${station.stationName}, ${latitude}, ${longitude}`)}`;

        window.open(url, "_blank", "noopener,noreferrer");
    }

    const handleDisableStation = async (stationId: string) => {
        try {
            const res = await setStatusAsInactive(stationId);

            if (res.status === 200) {
                onStationUpdated();
                toast.success("Station is removed successfully!");

            } else {
                toast.error(res.data.message);
                return;
            }            

        } catch(error) {
            console.error(error);
            toast.error("soething went wrong.");

        }
    }

    return (
        <MapContainer
            center={[7.8731, 80.7718]}
            zoom={7}
            scrollWheelZoom={true}
            className={
                "z-0 h-[360px] w-full overflow-hidden rounded-2xl border border-[#E2E7EF] sm:h-[480px] lg:h-[560px] " +
                "[&_img]:!max-w-none " +
                "[&_.leaflet-popup-content-wrapper]:rounded-3xl [&_.leaflet-popup-content-wrapper]:border [&_.leaflet-popup-content-wrapper]:border-[#E2E7EF] " +
                "[&_.leaflet-popup-content-wrapper]:bg-white [&_.leaflet-popup-content-wrapper]:p-1 " +
                "[&_.leaflet-popup-content-wrapper]:shadow-[0_12px_32px_rgba(13,27,42,0.18)] " +
                "[&_.leaflet-popup-content]:!m-4 [&_.leaflet-popup-tip]:shadow-none " +
                "[&_.leaflet-popup-close-button]:!right-2 [&_.leaflet-popup-close-button]:!top-2 [&_.leaflet-popup-close-button]:text-[#5B6B7E] " +
                "[&_.leaflet-control-zoom]:overflow-hidden [&_.leaflet-control-zoom]:rounded-2xl [&_.leaflet-control-zoom]:!border-[#E2E7EF] " +
                "[&_.leaflet-control-zoom]:shadow-[0_8px_20px_rgba(13,27,42,0.12)] " +
                "[&_.leaflet-control-zoom_a]:text-[#0D1B2A]"
            }
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {validStations.map((station) => (
                <CircleMarker
                    key={station.stationCode}
                    center={[
                        station.location.latitude,
                        station.location.longitude
                    ]}
                    radius={8}
                    pathOptions={{
                        color: "#ffffff",
                        fillColor: "#006D77",
                        fillOpacity: 1,
                        weight: 3
                    }}
                >
                    <Popup>
                        <div className="w-56 font-sans sm:w-64">
                            <h3 className="!m-0 pr-5 text-[17px] font-bold leading-snug tracking-tight text-[#0D1B2A]">
                                {`${station.stationName} Railway Station`}
                            </h3>

                            <p className="!mb-0 !mt-2 flex items-center gap-2 text-[13px] text-[#5B6B7E]">
                                Code
                                <span className="rounded-lg bg-[#E6F2F3] px-2.5 py-0.5 text-[12px] font-semibold text-[#006D77]">
                                    {station.stationCode}
                                </span>
                            </p>

                            <p className="!mb-4 !mt-2 text-[13px] leading-snug text-[#5B6B7E]">
                                Address: <span className="font-medium text-[#0D1B2A]">{station.address}</span>
                            </p>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleRedirectToMap(station)}
                                    className="h-11 w-full rounded-2xl bg-[#006D77] px-3 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(0,109,119,0.25)] transition hover:bg-[#005861] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/25 active:scale-[0.98]"
                                >
                                    Google Map Direction
                                </button>

                                <button
                                    onClick={() => handleDisableStation(station._id as string)}
                                    className="h-11 w-full rounded-2xl border border-[#E2E7EF] bg-white px-3 text-[13px] font-semibold text-[#B42318] transition hover:border-[#F4C7C3] hover:bg-[#FEF3F2] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#B42318]/15 active:scale-[0.98]"
                                >
                                    Remove Station
                                </button>
                            </div>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
};

export default StationMap;