import { FaLeaf, FaBolt, FaAward, FaFire } from "react-icons/fa";

function ProfileAchievementsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
        <p className="text-gray-500 mt-2">Badges you've earned from your energy habits.</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <FaLeaf className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Eco Friendly</h3>
              <p className="text-sm text-gray-500">
                Reduced electricity usage compared to previous months.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <FaBolt className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold">Smart Consumer</h3>
              <p className="text-sm text-gray-500">
                Successfully uploaded multiple electricity bills.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FaAward className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold">AI Explorer</h3>
              <p className="text-sm text-gray-500">
                Uses AI-powered insights to understand electricity usage.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <FaFire className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold">Consistent Tracker</h3>
              <p className="text-sm text-gray-500">
                Tracks electricity bills regularly every month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileAchievementsPage;