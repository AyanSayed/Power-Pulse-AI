import { useBill } from "../context/BillContext";
import {
  FaCalendarAlt,
  FaBolt,
  FaMoneyBillWave,
  FaIdCard,
} from "react-icons/fa";

import UploadBill from "./UploadBill";
import DailyUsageChart from "../components/DailyUsageChart";
import BillHistory from "../components/BillHistory";

function Bills() {
  const { bills, latestBill } = useBill();

  return (
    <div className="space-y-8">

      {/* Heading */}

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bills
        </h1>

        <p className="text-gray-500 mt-2">
          Manage your electricity bills, upload new bills and review your
          historical consumption.
        </p>
      </div>

      {/* Latest Bill */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Latest Bill Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          <div className="border rounded-xl p-5">

            <div className="flex items-center gap-3 mb-3">
              <FaCalendarAlt className="text-indigo-600" />
              <span className="text-sm text-gray-500">
                Billing Month
              </span>
            </div>

            <p className="text-2xl font-bold">
              {latestBill.month}
            </p>

          </div>

          <div className="border rounded-xl p-5">

            <div className="flex items-center gap-3 mb-3">
              <FaBolt className="text-yellow-500" />
              <span className="text-sm text-gray-500">
                Units Consumed
              </span>
            </div>

            <p className="text-2xl font-bold">
              {latestBill.units} kWh
            </p>

          </div>

          <div className="border rounded-xl p-5">

            <div className="flex items-center gap-3 mb-3">
              <FaMoneyBillWave className="text-green-600" />
              <span className="text-sm text-gray-500">
                Bill Amount
              </span>
            </div>

            <p className="text-2xl font-bold">
              ₹{latestBill.bill.toLocaleString("en-IN")}
            </p>

          </div>

          <div className="border rounded-xl p-5">

            <div className="flex items-center gap-3 mb-3">
              <FaIdCard className="text-blue-600" />
              <span className="text-sm text-gray-500">
                Consumer No.
              </span>
            </div>

            <p className="text-xl font-bold">
              PP-88213
            </p>

          </div>

        </div>

      </div>

      {/* Upload */}

      <UploadBill />

      {/* Daily Usage */}

      <DailyUsageChart
        latestUnits={latestBill.units}
      />

      {/* History */}

      <BillHistory bills={bills} />

    </div>
  );
}

export default Bills;