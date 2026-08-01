// Persists the user's self-reported appliance checklist (Tier 2 onboarding)
// and pincode (Tier 1 onboarding) client-side, the same way ProfileHomeDetailsPage
// persists home details — there's no authenticated backend user profile yet,
// so localStorage is the source of truth for now.

const PROFILE_KEY = "pp_appliance_profile";
const PINCODE_KEY = "pp_pincode";

export function emptyApplianceProfile() {
  return {
    AC: 0,
    WaterHeater: 0,
    Refrigerator: 0,
    WashingMachine: 0,
    TV: 0,
    Lights: 0,
  };
}

export function loadApplianceProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return { ...emptyApplianceProfile(), ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function saveApplianceProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadPincode() {
  try {
    return localStorage.getItem(PINCODE_KEY) || "";
  } catch {
    return "";
  }
}

export function savePincode(pincode) {
  localStorage.setItem(PINCODE_KEY, pincode);
}

// A profile only "counts" toward Tier 2 once at least one appliance is ticked —
// an all-zero object saved by accident shouldn't silently claim a higher tier.
export function isApplianceProfileMeaningful(profile) {
  if (!profile) return false;
  return Object.values(profile).some((v) => Number(v) > 0);
}