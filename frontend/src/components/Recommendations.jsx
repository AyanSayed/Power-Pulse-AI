import {
  FaSnowflake,
  FaLightbulb,
  FaClock,
  FaLeaf,
} from "react-icons/fa6";

const recommendations = [
  {
    icon: <FaSnowflake />,
    title: "Increase AC to 25°C",
    saving: "Save ₹220/month",
    color: "text-blue-600 bg-blue-100",
  },
  {
    icon: <FaClock />,
    title: "Shift Laundry Off-Peak",
    saving: "Save ₹180/month",
    color: "text-orange-600 bg-orange-100",
  },
  {
    icon: <FaLightbulb />,
    title: "Replace Old Bulbs",
    saving: "Save ₹90/month",
    color: "text-yellow-600 bg-yellow-100",
  },
  {
    icon: <FaLeaf />,
    title: "Reduce Standby Power",
    saving: "Save ₹60/month",
    color: "text-green-600 bg-green-100",
  },
];

function Recommendations() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          AI Recommendations
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Personalized suggestions to lower your electricity bill.
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${item.color}`}
              >
                {item.icon}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500">
                  {item.saving}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-400">Potential Saving</p>
              <p className="text-lg font-bold text-green-600">
                {item.saving.replace("Save ", "")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;