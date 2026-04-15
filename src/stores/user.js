import { defineStore } from "pinia";
import { getData, postData, putData, deleteData } from "@/plugins/axios"; // ✅ use full helpers
import Swal from "sweetalert2";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    user: null,
    loading: false,
    error: null,

  }),

  actions: {
    async create(payload) {
      try {
        this.loading = true;
        const data = await postData(
          "/user/register",
          payload,
          "User created successfully!"
        );
        return data;
      } catch (error) {
        this.error = error.message || "Failed to create user";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    // ✅ List all users
    async fetch() {
      try {
        this.loading = true;
        const data = await getData("/users");
        this.users = data;
      } catch (error) {
        this.error = error.message || "Failed to fetch users";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    // ✅ Get single user details
    async fetchuserById(id) {
      try {
        this.loading = true;
        const data = await getData(`/user/${id}`);
        this.user = data;
      } catch (error) {
        this.error = error.message || "Failed to fetch user details";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    // ✅ Update user info (admin/hr)
    async updateuser(id, payload) {
      try {
        this.loading = true;
        const data = await putData(
          `/users/${id}`,
          payload,
          "user updated successfully!"
        );
        this.user = data;
        const index = this.users.findIndex((e) => e._id === id);
        if (index !== -1) this.users[index] = data;
        return data;
      } catch (error) {
        this.error = error.message || "Failed to update user";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    // ✅ Delete user (admin/hr)
    async deleteuser(id) {
      try {
        this.loading = true;
        await deleteData(`/users/${id}`, "user deleted successfully!");
        this.users = this.users.filter((e) => e._id !== id);
      } catch (error) {
        this.error = error.message || "Failed to delete user";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async fetchPayrollHistory(userId) {
      try {
        this.loading = true;
        // 🔥 Uses the token automatically via Axios interceptor
        const data = await getData(`/payroll/${userId}`);
        this.payrollHistory = data;
        return data;
      } catch (error) {
        this.error = error.message || "Failed to fetch payroll history";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async fetchlatestPayslip(userId) {
      try {
        this.loading = true;
        // 🔥 Uses the token automatically via Axios interceptor
        const data = await getData(`/payroll/latestPayslip/${userId}`);
        this.latestPayslip = data;
        console.log(data)
        return data;
      } catch (error) {
        this.error = error.message || "Failed to fetch latest payslip";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async downloadPayslip(payrollId) {
      try {
        Swal.fire({
          title: "Generating Payslip...",
          text: "Please wait a moment.",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:3001/payroll/payslip/${payrollId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        // ✅ Convert response to blob (binary data)
        const blob = await response.blob();

        // ✅ Create object URL for the PDF blob
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Payslip-${payrollId}.pdf`; // The name of the file
        link.click();

        // ✅ Clean up memory
        window.URL.revokeObjectURL(url);

        Swal.fire({
          icon: "success",
          title: "Payslip downloaded successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Download error:", error);
        Swal.fire({
          icon: "error",
          title: "Error downloading payslip",
          text: error.message || "Something went wrong while downloading.",
        });
      }
    },
  },
});
