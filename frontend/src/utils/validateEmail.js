// Only @gmail.com addresses are allowed for registration and login.
export const GMAIL_ONLY_MESSAGE = "Only Gmail accounts are allowed.";

export function isGmailAddress(email) {
  return /^[^\s@]+@gmail\.com$/i.test((email || "").trim());
}