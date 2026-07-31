import AlertCard from "../components/AlertCard";

function AlertsPage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">All Alerts & Diagnostics</h1>
        <p className="mt-3 text-orange-100 max-w-3xl leading-7">
          Every issue the diagnostics engine has flagged from your current usage pattern.
        </p>
      </div>

      <AlertCard />
    </div>
  );
}

export default AlertsPage;