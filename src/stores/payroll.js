import { defineStore } from "pinia";
import { getData, postData } from "@/plugins/axios";

export const usePayrollStore = defineStore("payroll", {
  state: () => ({
    payrollHistory: [],
    currentEmployeePayroll: [],
    latestPayslip: null,
    loading: false,
    // For HR Analytics
    stats: {
      totalDisbursement: 0,
      employeeCount: 0,
    },
  }),

  actions: {
    /**
     * ✅ RUN PAYROLL (Admin/HR Only)
     * Triggers the calculation for the current month
     */
    async processMonthlyPayroll(payload) {
      try {
        this.loading = true;
        // payload could contain { month: 4, year: 2026, employeeIds: [...] }
        const data = await postData(
          "/payroll",
          payload,
          "Payroll processed successfully!",
        );
        return data;
      } catch (error) {
        console.error("Payroll processing failed:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * ✅ FETCH PAYROLL HISTORY
     * Gets all payslips for a specific employee
     */
    async fetchEmployeeHistory(employeeId) {
      try {
        this.loading = true;
        const data = await getData(`/payroll/${employeeId}`);
        this.currentEmployeePayroll = data;
        return data;
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * ✅ FETCH LATEST PAYSLIP
     * Useful for the "Quick View" in dashboards
     */
    async fetchLatest(employeeId) {
      try {
        this.loading = true;
        const data = await getData(`/payroll/latest-payslip/${employeeId}`);
        this.latestPayslip = data;
        return data;
      } catch (error) {
        console.error("Error fetching latest payslip:", error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * ✅ DOWNLOAD PDF
     * Directly opens the PDF download from the backend
     */
    async downloadPdf(payslipId) {
      try {
        const token = localStorage.getItem("token");
        // We use fetch here because axios doesn't handle file streams as easily as a direct blob
        const response = await fetch(
          `http://localhost:3001/payroll/payslip/${payslipId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) throw new Error("Download failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Payslip_${payslipId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("PDF Download Error:", error);
      }
    },
  },
});
