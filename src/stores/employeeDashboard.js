import { defineStore } from "pinia";
import { getData, postData, putData, deleteData } from "@/plugins/axios"; // ✅ use full helpers
import Swal from "sweetalert2";

export const useEmployeeDashboard = defineStore("employeeDashboard", {
  state: () => ({
    employees: [],
    employee: null,
    loading: false,
    error: null,
    payrollHistory: [],
    latestPayslip: {},
  }),

  actions: {
    // ✅ Create employee (admin/hr)
    async createEmployee(payload) {
      try {
        this.loading = true;
        const data = await postData(
          "/employees",
          payload,
          "Employee created successfully!"
        );
        this.employees.push(data);
        return data;
      } catch (error) {
        this.error = error.message || "Failed to create employee";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    // ✅ List all employees
    async fetchEmployees() {
      try {
        this.loading = true;
        const data = await getData("/employees");
        this.employees = data;
      } catch (error) {
        this.error = error.message || "Failed to fetch employees";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    // ✅ Get single employee details
    async fetchEmployeeById(id) {
      try {
        this.loading = true;
        const data = await getData(`/employee/${id}`);
        this.employee = data;
      } catch (error) {
        this.error = error.message || "Failed to fetch employee details";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    // ✅ Update employee info (admin/hr)
    async updateEmployee(id, payload) {
      try {
        this.loading = true;
        const data = await putData(
          `/employees/${id}`,
          payload,
          "Employee updated successfully!"
        );
        this.employee = data;
        const index = this.employees.findIndex((e) => e._id === id);
        if (index !== -1) this.employees[index] = data;
        return data;
      } catch (error) {
        this.error = error.message || "Failed to update employee";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    // ✅ Delete employee (admin/hr)
    async deleteEmployee(id) {
      try {
        this.loading = true;
        await deleteData(`/employees/${id}`, "Employee deleted successfully!");
        this.employees = this.employees.filter((e) => e._id !== id);
      } catch (error) {
        this.error = error.message || "Failed to delete employee";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async fetchPayrollHistory(employeeId) {
      try {
        this.loading = true;
        // 🔥 Uses the token automatically via Axios interceptor
        const data = await getData(`/payroll/${employeeId}`);
        this.payrollHistory = data;
        return data;
      } catch (error) {
        this.error = error.message || "Failed to fetch payroll history";
        console.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async fetchlatestPayslip(employeeId) {
      try {
        this.loading = true;
        // 🔥 Uses the token automatically via Axios interceptor
        const data = await getData(`/payroll/latestPayslip/${employeeId}`);
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
