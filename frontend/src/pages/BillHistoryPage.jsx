import { useBill } from "../context/BillContext";
import BillHistory from "../components/BillHistory";

function BillHistoryPage() {
  const { bills } = useBill();

  return (
    <div className="space-y-8">
      <BillHistory bills={bills} />
    </div>
  );
}

export default BillHistoryPage;