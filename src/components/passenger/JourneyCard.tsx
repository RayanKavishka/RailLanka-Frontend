import { TrainFront } from "lucide-react";

export interface JourneyCardProps {
  routeName: string;
  routeCode: string;
  departureTime: string;
  arrivalTime: string;
  startStation: string;
  destinationStation: string;
  duration: string;
  onSelect: () => void;
}

/**
 * Layout
 * - Mobile  (< 640px):  everything stacked, full-width button
 * - Tablet  (640-1023): stacked with roomier spacing and larger type
 * - Laptop  (>= 1024):  one row -> route info | timeline | button
 */
const JourneyCard = ({
  routeName,
  routeCode,
  departureTime,
  arrivalTime,
  startStation,
  destinationStation,
  duration,
  onSelect,
}: JourneyCardProps) => {
  return (
    <article className="w-full min-w-0 rounded-2xl bg-white p-4 shadow-[0_10px_30px_rgba(13,27,42,0.07)] transition duration-200 hover:shadow-[0_16px_40px_rgba(13,27,42,0.12)] sm:rounded-3xl sm:p-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] lg:items-center lg:gap-8 lg:px-8 lg:py-6">
      {/* Route info */}
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#0D1B2A] text-white sm:h-14 sm:w-14 sm:rounded-2xl">
          <TrainFront
            className="h-5 w-5 sm:h-7 sm:w-7"
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0">
          <h3 className="break-words text-base font-bold leading-snug text-[#0D1B2A] sm:text-lg">
            {routeName}
          </h3>
          <p className="mt-0.5 text-xs text-[#5B6B7E] sm:text-sm">
            Route Code: {routeCode}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-t border-slate-100 pt-4 sm:mt-5 sm:gap-5 sm:pt-5 lg:mt-0 lg:border-t-0 lg:pt-0">
        <div className="min-w-0">
          <p className="text-lg font-extrabold leading-6 text-[#0D1B2A] sm:text-2xl sm:leading-8">
            {departureTime}
          </p>
          <p className="mt-0.5 break-words text-xs text-[#5B6B7E] sm:text-sm">
            {startStation}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="whitespace-nowrap text-[11px] font-semibold text-[#006D77] sm:text-xs">
            {duration}
          </span>
          <div className="flex w-12 items-center sm:w-20 lg:w-24" aria-hidden="true">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#006D77]" />
            <span className="h-px flex-1 bg-slate-300" />
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#006D77]" />
          </div>
        </div>

        <div className="min-w-0 text-right">
          <p className="text-lg font-extrabold leading-6 text-[#0D1B2A] sm:text-2xl sm:leading-8">
            {arrivalTime}
          </p>
          <p className="mt-0.5 break-words text-xs text-[#5B6B7E] sm:text-sm">
            {destinationStation}
          </p>
        </div>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onSelect}
        className="mt-4 w-full rounded-xl bg-[#006D77] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#005861] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006D77] sm:mt-5 lg:mt-0 lg:w-auto lg:min-w-[160px]"
      >
        Select Journey
      </button>
    </article>
  );
};




export default JourneyCard;