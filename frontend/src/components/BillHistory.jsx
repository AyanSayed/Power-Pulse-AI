import { FaHistory, FaArrowUp, FaArrowDown, FaFileInvoice } from "react-icons/fa";

function BillHistory({ bills = [] }) {
  const rows = [...bills].reverse();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center text-xl">
          <FaHistory />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bill History</h2>
          <p className="text-sm text-gray-500">Every bill you've uploaded, most recent first</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12 text-gray-400">
          <FaFileInvoice className="text-3xl mb-3" />
          <p className="text-base">No bills uploaded yet. Upload one to start building your history.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((bill, index) => {
            const prev = rows[index + 1];
            const diff = prev ? bill.bill - prev.bill : null;
            const isLatest = index === 0;
            const isHigh = bill.status === "High";

            return (
              <div
                key={bill._id ?? `${bill.month}-${index}`}
                className={`rounded-2xl border-l-[6px] p-5 transition ${
                  isHigh
                    ? "bg-red-50 border-l-red-400"
                    : "bg-green-50 border-l-green-400"
                } ${isLatest ? "ring-2 ring-indigo-300" : ""}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">{bill.month}</h3>
                    {isLatest && (
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                        Latest
                      </span>
                    )}
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        isHigh ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700"
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>

                  {diff === null ? (
                    <span className="text-gray-400 text-sm">No prior month</span>
                  ) : diff > 0 ? (
                    <span className="flex items-center gap-1.5 text-red-600 text-sm font-semibold">
                      <FaArrowUp size={12} /> ₹{Math.abs(diff).toLocaleString("en-IN")} vs last month
                    </span>
                  ) : diff < 0 ? (
                    <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                      <FaArrowDown size={12} /> ₹{Math.abs(diff).toLocaleString("en-IN")} vs last month
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">No change</span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Units Consumed</p>
                    <p className="text-lg font-bold text-gray-900">{bill.units} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bill Amount</p>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{(bill.bill ?? 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BillHistory;