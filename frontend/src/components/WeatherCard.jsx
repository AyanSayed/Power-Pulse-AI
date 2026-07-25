import {
  FaCloudSun,
  FaTint,
  FaThermometerHalf,
  FaWind,
} from "react-icons/fa";
import { useBill } from "../context/BillContext";

// Rough mapping of Open-Meteo WMO weather codes to readable labels
function weatherCodeToLabel(code) {
  if (code === null || code === undefined) return "—";
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Cloudy";
}

function WeatherCard() {
  const { weatherTemp, weatherHumidity, weatherCondition } = useBill();

  const conditionLabel = weatherCodeToLabel(weatherCondition);
  const isHot = weatherTemp !== null && weatherTemp > 30;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-500 text-xl">
          <FaCloudSun />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Weather
          </h2>
          <p className="text-sm text-gray-500">
            Environmental conditions
          </p>
        </div>
      </div>

      {/* Weather Details */}
      <div className="space-y-4">

        <div className="flex justify-between items-center border rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-600">
            <FaThermometerHalf />
            <span>Temperature</span>
          </div>

          <span className="font-bold text-lg">
            {weatherTemp !== null ? `${weatherTemp}°C` : "Loading..."}
          </span>
        </div>

        <div className="flex justify-between items-center border rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-600">
            <FaTint />
            <span>Humidity</span>
          </div>

          <span className="font-bold text-lg">
            {weatherHumidity !== null ? `${weatherHumidity}%` : "Loading..."}
          </span>
        </div>

        <div className="flex justify-between items-center border rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-600">
            <FaWind />
            <span>Condition</span>
          </div>

          <span className="font-semibold">
            {conditionLabel}
          </span>
        </div>

      </div>

      {/* AI Note */}
      {isHot && (
        <div className="mt-6 border-t pt-5">
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
            <p className="text-sm text-gray-700 leading-6">
              🌡 Higher temperatures are likely increasing AC usage, which may contribute to a higher electricity bill this month.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherCard;