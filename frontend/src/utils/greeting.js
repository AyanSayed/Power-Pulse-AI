// Returns a greeting based on the current local time, so pages never need
// the time of day entered manually — it's read straight from the device clock.
export function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}