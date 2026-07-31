import Recommendations from "../components/Recommendations";

function RecommendationsPage() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">All Recommendations</h1>
        <p className="mt-3 text-teal-100 max-w-3xl leading-7">
          Every AI-generated tip for lowering your bill, based on your usage pattern.
        </p>
      </div>

      <Recommendations />
    </div>
  );
}

export default RecommendationsPage;