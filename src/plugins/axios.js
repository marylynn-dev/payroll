import axios from "axios";
import Swal from "sweetalert2";

// 🔧 Axios instance setup
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    console.error("API Error:", message);

    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      confirmButtonColor: "#d33",
    });

    return Promise.reject(error);
  }
);

/* ----------------------------
   🔽 CRUD API HELPERS
----------------------------- */

// ✅ GET request
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

// ✅ POST request
export const postData = async (
  endpoint,
  data,
  successMsg = "Created successfully!"
) => {
  const res = await api.post(endpoint, data);
  Swal.fire({
    icon: "success",
    title: successMsg,
    timer: 1500,
    showConfirmButton: false,
  });
  return res.data;
};

// ✅ PUT request
export const putData = async (
  endpoint,
  data,
  successMsg = "Updated successfully!"
) => {
  const res = await api.put(endpoint, data);
  Swal.fire({
    icon: "success",
    title: successMsg,
    timer: 1500,
    showConfirmButton: false,
  });
  return res.data;
};

// ✅ DELETE request
export const deleteData = async (
  endpoint,
  successMsg = "Deleted successfully!"
) => {
  const res = await api.delete(endpoint);
  Swal.fire({
    icon: "success",
    title: successMsg,
    timer: 1500,
    showConfirmButton: false,
  });
  return res.data;
};

export default api;
