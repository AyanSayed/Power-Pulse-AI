import { useBill } from "../context/BillContext";
import BillHistory from "../components/BillHistory";

function BillHistoryPage() {
  const { bills } = useBill();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bill History</h1>
        <p className="text-gray-500 mt-2">Every bill you've uploaded, in one place.</p>
      </div>

      <BillHistory bills={bills} />
    </div>
  );
}

export default BillHistoryPage;