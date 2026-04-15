import axios from "axios";
import Swal from "sweetalert2";
import router from "@/router"; // ✅ Import router for redirection

// 🔧 Axios instance setup
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    // ✅ This satisfies your backend's verifyAccessToken requirement
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ⚠️ Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "An error occurred";

    // ✅ If token is invalid or expired (Unauthorized)
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // Clear user data too

      Swal.fire({
        icon: "warning",
        title: "Session Expired",
        text: "Please login again to continue.",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        router.push("/"); // Redirect to login
      });
    } else {
      // General errors
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
        confirmButtonColor: "#d33",
      });
    }

    return Promise.reject(error);
  },
);

/* ----------------------------
    🔽 CRUD API HELPERS
----------------------------- */

export const getData = async (endpoint, params = {}, showSuccess = false) => {
  const res = await api.get(endpoint, { params });
  if (showSuccess)
    Swal.fire({
      icon: "success",
      title: "Data Loaded",
      timer: 1500,
      showConfirmButton: false,
    });
  return res.data;
};

export const postData = async (
  endpoint,
  data,
  successMsg = "Created successfully!",
) => {
  const res = await api.post(endpoint, data);
  if (successMsg)
    Swal.fire({
      icon: "success",
      title: successMsg,
      timer: 1500,
      showConfirmButton: false,
    });
  return res.data;
};

export const putData = async (
  endpoint,
  data,
  successMsg = "Updated successfully!",
) => {
  const res = await api.put(endpoint, data);
  if (successMsg)
    Swal.fire({
      icon: "success",
      title: successMsg,
      timer: 1500,
      showConfirmButton: false,
    });
  return res.data;
};

export const deleteData = async (
  endpoint,
  successMsg = "Deleted successfully!",
) => {
  const res = await api.delete(endpoint);
  if (successMsg)
    Swal.fire({
      icon: "success",
      title: successMsg,
      timer: 1500,
      showConfirmButton: false,
    });
  return res.data;
};

export default api;
