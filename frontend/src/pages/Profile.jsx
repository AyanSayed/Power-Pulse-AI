import { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaHome,
  FaUsers,
  FaBolt,
  FaLeaf,
  FaMedal,
  FaAward,
  FaFire,
  FaCalendarAlt,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { useBill } from "../context/BillContext";
import { useToast } from "../context/ToastContext";

import EnergyScoreRing from "../components/EnergyScoreRing";

function loadHomeDetails() {
  try {
    const saved = localStorage.getItem("pp_home_details");
    return saved
      ? JSON.parse(saved)
      : {
          houseType: "Apartment",
          residents: 3,
        };
  } catch {
    return {
      houseType: "Apartment",
      residents: 3,
    };
  }
}

function Profile() {
  const { user } = useAuth();

  const {
    bills,
    latestBill,
    energyScore,
    carbonKg,
  } = useBill();

  const { showToast } = useToast();

  const [homeDetails, setHomeDetails] = useState(loadHomeDetails);

  useEffect(() => {
    localStorage.setItem(
      "pp_home_details",
      JSON.stringify(homeDetails)
    );
  }, [homeDetails]);

  const handleSave = (e) => {
    e.preventDefault();
    showToast("Home details updated", "success");
  };

  const name = user?.name || "Ayan Sharma";
  const email = user?.email || "ayan@example.com";
  const initial = name.charAt(0);

  const totalUnits = bills.reduce(
    (sum, bill) => sum + bill.units,
    0
  );

  const billsUploaded = bills.length;

  const totalCarbon = bills.reduce(
    (sum, bill) => sum + bill.units * 0.82,
    0
  );

  const performance =
    energyScore >= 85
      ? {
          title: "Excellent Energy Efficiency",
          color: "text-green-600",
        }
      : energyScore >= 70
      ? {
          title: "Good Energy Efficiency",
          color: "text-emerald-600",
        }
      : energyScore >= 50
      ? {
          title: "Average Performance",
          color: "text-yellow-600",
        }
      : {
          title: "Needs Improvement",
          color: "text-red-600",
        };

  return (
    <div className="space-y-8">

      {/* HERO */}

      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-lg">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

          <div className="flex items-center gap-6">

            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-5xl font-bold border-4 border-white/30">
              {initial}
            </div>

            <div>

              <h1 className="text-4xl font-bold">
                {name}
              </h1>

              <p className="text-blue-100 mt-2">
                PowerPulse AI Member
              </p>

              <div className="flex flex-wrap gap-5 mt-6 text-sm">

                <div className="flex items-center gap-2">
                  <FaEnvelope />
                  {email}
                </div>

                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt />
                  Navi Mumbai
                </div>

                <div className="flex items-center gap-2">
                  <FaCalendarAlt />
                  Member Since 2026
                </div>

              </div>

            </div>

          </div>

          <div className="bg-white rounded-2xl p-6 text-gray-900 min-w-[260px]">

            <EnergyScoreRing score={energyScore} />

            <div className="text-center mt-5">

              <p
                className={`font-semibold ${performance.color}`}
              >
                {performance.title}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <div className="flex items-center gap-3 mb-4">

            <FaBolt className="text-yellow-500 text-xl" />

            <h3 className="font-semibold text-gray-900">
              Lifetime Usage
            </h3>

          </div>

          <p className="text-3xl font-bold">
            {totalUnits}
          </p>

          <p className="text-gray-500 mt-2">
            kWh Consumed
          </p>

        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <div className="flex items-center gap-3 mb-4">

            <FaHome className="text-indigo-600 text-xl" />

            <h3 className="font-semibold">
              Bills Uploaded
            </h3>

          </div>

          <p className="text-3xl font-bold">
            {billsUploaded}
          </p>

          <p className="text-gray-500 mt-2">
            Bills Processed
          </p>

        </div>  

{/* Energy Score */}

        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <div className="flex items-center gap-3 mb-4">

            <FaAward className="text-green-600 text-xl" />

            <h3 className="font-semibold">
              Energy Score
            </h3>

          </div>

          <p className="text-3xl font-bold">
            {energyScore}/100
          </p>

          <p className={`mt-2 ${performance.color}`}>
            {performance.title}
          </p>

        </div>

        {/* Carbon */}

        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <div className="flex items-center gap-3 mb-4">

            <FaLeaf className="text-emerald-600 text-xl" />

            <h3 className="font-semibold">
              Carbon Saved
            </h3>

          </div>

          <p className="text-3xl font-bold">
            {Math.round(totalCarbon)} kg
          </p>

          <p className="text-gray-500 mt-2">
            Estimated CO₂ Offset
          </p>

        </div>

      </div>

      {/* Home Details + Achievements */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Home Details */}

        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🏠 Home Details
          </h2>

          <div className="space-y-5">

            <div className="flex justify-between border-b pb-3">

              <span className="text-gray-500">
                House Type
              </span>

              <span className="font-semibold">
                {homeDetails.houseType}
              </span>

            </div>

            <div className="flex justify-between border-b pb-3">

              <span className="text-gray-500">
                Residents
              </span>

              <span className="font-semibold">
                {homeDetails.residents}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-500">
                Current Bill
              </span>

              <span className="font-semibold">
                ₹{latestBill.bill.toLocaleString("en-IN")}
              </span>

            </div>

          </div>

        </div>

        {/* Achievements */}

        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🏆 Achievements
          </h2>

          <div className="space-y-5">

            <div className="flex gap-4">

              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <FaLeaf className="text-green-600" />
              </div>

              <div>

                <h3 className="font-semibold">
                  Eco Friendly
                </h3>

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

                <h3 className="font-semibold">
                  Smart Consumer
                </h3>

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

                <h3 className="font-semibold">
                  AI Explorer
                </h3>

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

                <h3 className="font-semibold">
                  Consistent Tracker
                </h3>

                <p className="text-sm text-gray-500">
                  Tracks electricity bills regularly every month.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Edit Home Details */}

      <div className="bg-white rounded-2xl border shadow-sm p-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ✏ Edit Home Details
        </h2>

        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >

          <div>

            <label className="block mb-2 font-medium">
              House Type
            </label>

            <select
              value={homeDetails.houseType}
              onChange={(e) =>
                setHomeDetails({
                  ...homeDetails,
                  houseType: e.target.value,
                })
              }
              className="w-full border rounded-xl px-4 py-3"
            >
              <option>Apartment</option>
              <option>Independent House</option>
              <option>Villa</option>
            </select>

          </div>

          <div>

            <label className="block mb-2 font-medium">
              Number of Residents
            </label>

            <input
              type="number"
              min={1}
              max={20}
              value={homeDetails.residents}
              onChange={(e) =>
                setHomeDetails({
                  ...homeDetails,
                  residents: Number(e.target.value),
                })
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

export default Profile;