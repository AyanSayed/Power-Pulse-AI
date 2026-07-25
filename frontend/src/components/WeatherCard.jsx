import {
  FaCloudSun,
  FaTint,
  FaThermometerHalf,
  FaWind,
} from "react-icons/fa";

function WeatherCard() {
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
            32°C
          </span>
        </div>

        <div className="flex justify-between items-center border rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-600">
            <FaTint />
            <span>Humidity</span>
          </div>

          <span className="font-bold text-lg">
            72%
          </span>
        </div>

        <div className="flex justify-between items-center border rounded-xl p-3">
          <div className="flex items-center gap-2 text-gray-600">
            <FaWind />
            <span>Condition</span>
          </div>

          <span className="font-semibold">
            Cloudy
          </span>
        </div>

      </div>

      {/* AI Note */}
      <div className="mt-6 border-t pt-5">
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-sm text-gray-700 leading-6">
            🌡 Higher temperatures are likely increasing AC usage, which may contribute to a higher electricity bill this month.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;