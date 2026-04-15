import { defineStore } from "pinia";
import { getData, postData, putData } from "@/plugins/axios"; // ✅ Use your existing helpers
import router from "@/router"; // Assuming you use vue-router

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null, // Logged in user info
    pendingRequests: [], // For HR Dashboard
    loading: false,
    token: localStorage.getItem("accessToken") || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isHR: (state) => state.user?.role === 'hr' || state.user?.role === 'admin',
  },

  actions: {
    // ✅ Login Logic
    async login(credentials) {
      try {
        this.loading = true;
        const data = await postData("/user/login", credentials);
        this.token = data.accessToken;
        this.user = data.user;
        console.log(data)
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        
        return data;
      } catch (error) {
        throw error; // Let the component handle the specific error message
      } finally {
        this.loading = false;
      }
    },

    // ✅ Request Access (Registration Phase)
    async requestAccess(payload) {
      try {
        this.loading = true;
        return await postData("/user/request-access", payload, "Request sent to HR successfully!");
      } finally {
        this.loading = false;
      }
    },

    // ✅ HR Action: Fetch Pending Approvals
    async fetchPendingRequests() {
      try {
        this.loading = true;
        const data = await getData("/employee/pending-requests");
        this.pendingRequests = data;
      } finally {
        this.loading = false;
      }
    },

    // ✅ HR Action: Approve Employee Access
    async approveEmployee(id) {
      try {
        this.loading = true;
        const data = await putData(`/employee/approve-access/${id}`, {}, "User approved successfully!");
        // Remove from pending list locally
        this.pendingRequests = this.pendingRequests.filter(req => req._id !== id);
        return data;
      } finally {
        this.loading = false;
      }
    },

    // ✅ Logout
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/login");
    }
  },
});