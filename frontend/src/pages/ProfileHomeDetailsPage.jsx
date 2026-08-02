import { useState, useEffect } from "react";
import { useBill } from "../context/BillContext";
import { useToast } from "../context/ToastContext";

function loadHomeDetails() {
  try {
    const saved = localStorage.getItem("pp_home_details");
    return saved ? JSON.parse(saved) : { houseType: "Apartment", residents: 3 };
  } catch {
    return { houseType: "Apartment", residents: 3 };
  }
}

function ProfileHomeDetailsPage() {
  const { latestBill } = useBill();
  const { showToast } = useToast();
  const [homeDetails, setHomeDetails] = useState(loadHomeDetails);

  useEffect(() => {
    localStorage.setItem("pp_home_details", JSON.stringify(homeDetails));
  }, [homeDetails]);

  const handleSave = (e) => {
    e.preventDefault();
    showToast("Home details updated", "success");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Home Details</h1>
        <p className="text-gray-500 mt-2">Your household info, used to personalize AI insights.</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🏠 Current Details</h2>

        <div className="space-y-5">
          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">House Type</span>
            <span className="font-semibold">{homeDetails.houseType}</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-500">Residents</span>
            <span className="font-semibold">{homeDetails.residents}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Current Bill</span>
            <span className="font-semibold">
              ₹{(latestBill?.bill ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">✏ Edit Home Details</h2>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">House Type</label>
            <select
              value={homeDetails.houseType}
              onChange={(e) => setHomeDetails({ ...homeDetails, houseType: e.target.value })}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option>Apartment</option>
              <option>Independent House</option>
              <option>Villa</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">Number of Residents</label>
            <input
              type="number"
              min={1}
              max={20}
              value={homeDetails.residents}
              onChange={(e) =>
                setHomeDetails({ ...homeDetails, residents: Number(e.target.value) })
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-8 py-3 rounded-xl font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileHomeDetailsPage;