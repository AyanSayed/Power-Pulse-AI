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
          <p className="text-sm">No bills uploaded yet. Upload one to start building your history.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-2 font-medium">Month</th>
                <th className="px-4 py-2 font-medium">Units</th>
                <th className="px-4 py-2 font-medium">Bill</th>
                <th className="px-4 py-2 font-medium">Trend</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((bill, index) => {
                const prev = rows[index + 1];
                const diff = prev ? bill.bill - prev.bill : null;
                const isLatest = index === 0;

                return (
                  <tr
                    key={bill._id ?? `${bill.month}-${index}`}
                    className={`transition ${
                      isLatest
                        ? "bg-indigo-50/60 border border-indigo-100"
                        : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                    }`}
                  >
                    <td className="px-4 py-3.5 rounded-l-xl font-medium text-gray-900">
                      {bill.month}
                      {isLatest && (
                        <span className="ml-2 text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                          Latest
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 tabular-nums text-gray-600">{bill.units} kWh</td>
                    <td className="px-4 py-3.5 tabular-nums font-semibold text-gray-900">
                      ₹{(bill.bill ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5">
                      {diff === null ? (
                        <span className="text-gray-400 text-xs">—</span>
                      ) : diff > 0 ? (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                          <FaArrowUp size={10} /> ₹{Math.abs(diff).toLocaleString("en-IN")}
                        </span>
                      ) : diff < 0 ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <FaArrowDown size={10} /> ₹{Math.abs(diff).toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">No change</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 rounded-r-xl">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          bill.status === "High"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BillHistory;