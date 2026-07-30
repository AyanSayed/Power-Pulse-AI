function BillHistory({ bills = [] }) {
  const rows = [...bills].reverse();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-navy p-6 card-lift">
      <h2 className="font-display text-xl font-semibold text-ink mb-5">Bill History</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate border-b border-gray-100">
              <th className="py-3 font-medium">Month</th>
              <th className="py-3 font-medium">Units</th>
              <th className="py-3 font-medium">Bill</th>
              <th className="py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((bill, index) => (
                <tr key={bill._id ?? `${bill.month}-${index}`} className="border-b border-gray-50 hover:bg-mist transition">
                <td className="py-3.5 text-ink font-medium">{bill.month}</td>
                <td className="py-3.5 tabular text-slate">{bill.units} kWh</td>
                <td className="py-3.5 tabular text-ink">₹{(bill.bill ?? 0).toLocaleString("en-IN")}</td>
                <td className="py-3.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      bill.status === "High" ? "bg-coral-soft text-coral" : "bg-teal-soft text-teal"
                    }`}
                  >
                    {bill.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BillHistory;
