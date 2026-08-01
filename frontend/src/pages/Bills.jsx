import { Link } from "react-router-dom";
import { useBill } from "../context/BillContext";
import {
  FaCalendarAlt,
  FaBolt,
  FaMoneyBillWave,
  FaIdCard,
  FaCloudUploadAlt,
  FaChartBar,
  FaHistory,
  FaArrowRight,
} from "react-icons/fa";

const sections = [
  {
    to: "/bills/upload",
    title: "Upload Bill",
    desc: "Add a new electricity bill",
    icon: <FaCloudUploadAlt />,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    to: "/bills/daily-usage",
    title: "Daily Usage",
    desc: "See your day-by-day consumption",
    icon: <FaChartBar />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    to: "/bills/history",
    title: "Bill History",
    desc: "Every bill you've uploaded",
    icon: <FaHistory />,
    color: "bg-purple-100 text-purple-600",
  },
];

function Bills() {
  const { latestBill } = useBill();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
        <p className="text-gray-500 mt-2">
          Manage your electricity bills, upload new bills and review your
          historical consumption.
        </p>
      </div>

      {!latestBill ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          Loading your bills...
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Latest Bill Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FaCalendarAlt className="text-indigo-600" />
                <span className="text-sm text-gray-500">Billing Month</span>
              </div>
              <p className="text-2xl font-bold">{latestBill.month}</p>
            </div>

            <div className="border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FaBolt className="text-yellow-500" />
                <span className="text-sm text-gray-500">Units Consumed</span>
              </div>
              <p className="text-2xl font-bold">{latestBill.units} kWh</p>
            </div>

            <div className="border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FaMoneyBillWave className="text-green-600" />
                <span className="text-sm text-gray-500">Bill Amount</span>
              </div>
              <p className="text-2xl font-bold">
                ₹{(latestBill.bill ?? 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <FaIdCard className="text-blue-600" />
                <span className="text-sm text-gray-500">Consumer No.</span>
              </div>
              <p className="text-xl font-bold">PP-88213</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${s.color}`}
              >
                {s.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
            </div>
            <div className="flex items-center gap-2 text-indigo-600 font-medium mt-4">
              Open <FaArrowRight />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Bills;