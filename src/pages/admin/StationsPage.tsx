import { useCallback, useEffect, useState } from "react";
import StationMap from "./StationMap";
import { getAllStations } from "../../services/routeService";
import { toast } from "sonner";
import Loading from "../../components/ui/Loading";
import { saveStation } from "../../services/stationService";
import { ArrowLeftRight, ArrowUpDown } from "lucide-react";


export interface IStation {
    _id?: string;
    stationName: string;
    stationCode: string;
    location: {
        latitude: number;
        longitude: number;
    },
    address: string;
    isActive?: boolean;
}


// RailLanka design tokens (Tailwind classes only)
const inputClass =
    "h-[52px] w-full rounded-2xl border border-[#E2E7EF] bg-white px-4 text-[15px] text-[#0D1B2A] " +
    "placeholder:text-[#5B6B7E]/55 transition " +
    "hover:border-[#CBD3DF] " +
    "focus:border-[#006D77] focus:outline-none focus:ring-4 focus:ring-[#006D77]/15";

const labelClass = "mb-2 block text-[14px] font-semibold leading-snug text-[#0D1B2A]";

const coordLabelClass =
    "mb-2 flex items-center gap-2.5 text-[14px] font-semibold leading-snug text-[#0D1B2A]";

const coordIconClass =
    "grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#E6F2F3] text-[#006D77]";

const coordHintClass = "mt-2 text-[13px] leading-relaxed text-[#5B6B7E]";

const googleLinkClass =
    "ml-1 inline-flex items-center rounded-lg bg-[#E6F2F3] px-2 py-0.5 text-[12px] font-semibold text-[#006D77] " +
    "transition hover:bg-[#D3E8EA] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/20";

const primaryBtnClass =
    "inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#006D77] px-8 text-[15px] font-semibold text-white " +
    "shadow-[0_8px_20px_rgba(0,109,119,0.25)] transition hover:bg-[#005861] " +
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/25 active:scale-[0.98] sm:w-auto";

const cardClass =
    "overflow-hidden rounded-3xl border border-[#E2E7EF]/70 bg-white shadow-[0_8px_24px_rgba(13,27,42,0.06)]";

const sectionTitleClass = "text-[20px] font-bold leading-tight tracking-tight text-[#0D1B2A]";
const sectionHintClass = "mt-1.5 text-[14px] leading-relaxed text-[#5B6B7E]";

const StationsPage = () => {

    const [stations, setStations] = useState<IStation[]>([]);
    const [loading, setLoading] = useState(false);

    const [stationName, setStationName] = useState<string>("");
    const [stationCode, setStationCode] = useState<string>("");
    const [latitude, setLatitude] = useState<string>("");
    const [longitude, setLongitude] = useState<string>("");
    const [address, setAddress] = useState<string>("");

    const hadleAddStationBtn = async () => {

        const data: IStation = {
            stationName,
            stationCode,
            location: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            },
            address
        }

        setLoading(true);
        try {
            const res = await saveStation(data);

            if (res.status === 200 || res.status === 201) {
                toast.success("Station is added successfully!");
                
                setStationName("");
                setStationCode("");
                setLatitude("");
                setLongitude("");
                setAddress("");

                await fetchStations();

            } else {
                toast.error(res.data.message);
                setLoading(false);
                return;
            }            

        } catch(error) {
            console.error(error);
            toast.error("something went wrong.");
            setLoading(false);

        } finally {
            setLoading(false);
        }
    }

    const fetchStations = useCallback(async () => {
        setLoading(true);

        try {
            const res = await getAllStations();

            if (res.status === 200) {
                setStations(res.data.body);
            } else {
                toast.error(res.data.message);
                setStations([]);
            }

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong.");
            setStations([]);

        } finally {
            setLoading(false);
        }

    }, []);

    useEffect(() => {
        fetchStations();

    }, [fetchStations]);

    if (loading) {
        return <Loading />;

    } else {
        return (
            <>
                <section className="w-full flex-1 bg-[#F4F6FA] px-4 pb-6 pt-0 text-[#0D1B2A] sm:px-6 sm:pb-8 lg:pb-10">
                    <div className="mx-auto w-full max-w-[1280px] space-y-5 sm:space-y-6">

                        {/* Add station card */}
                        <form
                            method="POST"
                            className={cardClass}
                        >
                            <div className="p-5 sm:p-8">

                                {/* Card header */}
                                <h1 className="text-[26px] font-bold leading-tight tracking-tight text-[#0D1B2A] sm:text-[30px]">
                                    Stations
                                </h1>
                                <p className="mt-1.5 text-[15px] leading-relaxed text-[#5B6B7E]">
                                    Add a new station and manage the ones on the map.
                                </p>

                                {/* Summary banner */}
                                <div className="mt-5 flex flex-col gap-4 rounded-[28px] bg-gradient-to-r from-[#0B1020] via-[#16224D] to-[#243B8A] px-6 py-5 text-white sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
                                    <div>
                                        <p className="text-[28px] font-bold leading-none tracking-tight sm:text-[34px]">
                                            {stations.length}
                                        </p>
                                        <p className="mt-2 text-[15px] text-white/80">
                                            Active stations
                                        </p>
                                    </div>
                                    <div className="sm:text-right">
                                        <p className="text-[18px] font-bold tracking-tight">
                                            Sri Lanka Railways
                                        </p>
                                        <p className="mt-1 text-[14px] text-white/70">
                                            Station network
                                        </p>
                                    </div>
                                </div>

                                {/* Station details */}
                                <h2 className={`${sectionTitleClass} mt-8 sm:mt-10`}>
                                    Station details
                                </h2>

                                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">

                                    <div>
                                        <label htmlFor="stationName" className={labelClass}>
                                            Station name
                                        </label>
                                        <input
                                            id="stationName"
                                            type="text" 
                                            name="stationName"
                                            value={stationName}
                                            onChange={(e) => setStationName(e.target.value)}
                                            placeholder="e.g. Colombo Fort"
                                            className={inputClass}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="stationCode" className={labelClass}>
                                            Station code
                                        </label>
                                        <input
                                            id="stationCode"
                                            type="text" 
                                            name="stationCode"
                                            value={stationCode}
                                            onChange={(e) => setStationCode(e.target.value)}
                                            placeholder="e.g. CMBF"
                                            className={inputClass}
                                        />
                                    </div>

                                </div>

                                {/* Location */}
                                <h2 className={`${sectionTitleClass} mt-8 sm:mt-10`}>
                                    Location
                                </h2>
                                <p className={sectionHintClass}>
                                    Coordinates are used to place the station on the map.
                                </p>

                                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">

                                    <div>
                                        <label htmlFor="latitude" className={coordLabelClass}>
                                            <span className={coordIconClass}>
                                                <ArrowUpDown className="h-4 w-4" />
                                            </span>
                                            <span>
                                                Latitude
                                                <span className="ml-1.5 font-normal text-[#5B6B7E]">(north – south)</span>
                                            </span>
                                        </label>
                                        <input
                                            id="latitude"
                                            type="text" 
                                            inputMode="decimal"
                                            name="latitude"
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            placeholder="e.g. 6.93389"
                                            className={inputClass}
                                        />
                                        <p className={coordHintClass}>
                                            Right-click the station on Google Maps and copy the first number.
                                            <a
                                                href="https://www.google.com/maps"
                                                target="_blank"
                                                rel="noreferrer"
                                                className={googleLinkClass}
                                            >
                                                Open Google Maps
                                            </a>
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="longitude" className={coordLabelClass}>
                                            <span className={coordIconClass}>
                                                <ArrowLeftRight className="h-4 w-4" />
                                            </span>
                                            <span>
                                                Longitude
                                                <span className="ml-1.5 font-normal text-[#5B6B7E]">(east – west)</span>
                                            </span>
                                        </label>
                                        <input
                                            id="longitude"
                                            type="text" 
                                            inputMode="decimal"
                                            name="longitude"
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            placeholder="e.g. 79.85083"
                                            className={inputClass}
                                        />
                                        <p className={coordHintClass}>
                                            Right-click the station on Google Maps and copy the second number.
                                            <a
                                                href="https://www.google.com/maps"
                                                target="_blank"
                                                rel="noreferrer"
                                                className={googleLinkClass}
                                            >
                                                Open Google Maps
                                            </a>
                                        </p>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="address" className={labelClass}>
                                            Address
                                        </label>
                                        <input
                                            id="address"
                                            type="text" 
                                            name="address"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="e.g. Colombo Fort Railway Station, Colombo, Sri Lanka"
                                            className={inputClass}
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* Footer action bar */}
                            <div className="flex border-t border-[#E2E7EF] bg-[#F8FAFC] px-5 py-4 sm:justify-end sm:px-8">
                                <button 
                                    type="button"
                                    onClick={hadleAddStationBtn}
                                    className={primaryBtnClass}
                                >
                                    Add Station
                                </button>
                            </div>
                        </form>

                        {/* Map card */}
                        <div className={`${cardClass} p-5 sm:p-8`}>
                            <h2 className={sectionTitleClass}>Station map</h2>
                            <p className={sectionHintClass}>
                                Select a station to get directions or remove it.
                            </p>

                            <div className="mt-5">
                                <StationMap 
                                    stations={stations}
                                    onStationUpdated={fetchStations}
                                />
                            </div>
                        </div>

                    </div>
                </section>
            </>
        );
    }
}



export default StationsPage