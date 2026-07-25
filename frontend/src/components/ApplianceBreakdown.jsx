import {
  FaSnowflake,
  FaTv,
  FaFan,
  FaBlender,
} from "react-icons/fa6";

const icons = {
  AC: <FaSnowflake />,
  Refrigerator: <FaBlender />,
  TV: <FaTv />,
  Fan: <FaFan />,
};

function ApplianceBreakdown({ data = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          High-Power Appliances
        </h2>
        <p className="text-sm text-gray-500">
          Appliances contributing the most to your bill
        </p>
      </div>

      <div className="space-y-5">
        {data.map((item) => (
          <div key={item.name}>
            <div className="flex items-center justify-between mb-2">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  {icons[item.name] || <FaFan />}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    Energy Consumption
                  </p>
                </div>

              </div>

              <span className="font-semibold text-gray-800">
                {item.pct}%
              </span>

            </div>

            <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">

              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                style={{ width: `${item.pct}%` }}
              />

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplianceBreakdown;