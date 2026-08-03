import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function signupRequest({ name, email, password }) {
  const res = await axios.post(`${API_URL}/api/users/signup`, { name, email, password });
  return res.data; // { message, user }
}

export async function loginRequest({ email, password }) {
  const res = await axios.post(`${API_URL}/api/users/login`, { email, password });
  return res.data; // { token, user }
}

export async function getMeRequest(token) {
  const res = await axios.get(`${API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // { user }
}
