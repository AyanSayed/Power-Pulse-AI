import WeatherCard from "../components/WeatherCard";

function WeatherPage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Weather Impact</h1>
        <p className="mt-3 text-sky-100 max-w-3xl leading-7">
          How local weather is influencing your electricity usage.
        </p>
      </div>

      <WeatherCard />
    </div>
  );
}

export default WeatherPage;