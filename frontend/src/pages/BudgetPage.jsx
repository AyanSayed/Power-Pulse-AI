import BudgetTracker from "../components/BudgetTracker";

function BudgetPage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Budget Tracker</h1>
        <p className="mt-3 text-teal-100 max-w-3xl leading-7">
          Set a monthly spending target and PowerPulse will tell you exactly
          how much you can safely use each day to stay under it.
        </p>
      </div>

      <BudgetTracker />
    </div>
  );
}

export default BudgetPage;