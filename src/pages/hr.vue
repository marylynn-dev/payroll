<template>
  <v-container fluid class="pa-0">
    <v-card flat class="fill-screen bg-grey-lighten-4">
      <v-toolbar color="white" flat border-bottom>
        <v-toolbar-title class="text-h6 font-weight-bold text-primary">
          <v-icon icon="mdi-shield-check" class="mr-2" />
          PayRoll Pro
          <span class="text-grey-darken-1 font-weight-light">| HR Portal</span>
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <div class="d-flex align-center px-4">
          <div class="text-right mr-3 d-none d-sm-block">
            <div class="text-subtitle-2 font-weight-bold">Admin User</div>
            <div class="text-caption text-grey">HR Manager</div>
          </div>
          <v-avatar color="primary" size="40">
            <span class="text-white">HR</span>
          </v-avatar>
          <v-btn
            icon="mdi-logout-variant"
            variant="text"
            color="grey-darken-1"
            @click="handleLogout"
            class="ml-2"
          ></v-btn>
        </div>
      </v-toolbar>

      <div class="d-flex flex-row full-width">
        <v-tabs
          v-model="tab"
          color="primary"
          direction="vertical"
          class="sidebar pt-4"
        >
          <v-tab value="dashboard" class="justify-start px-6">
            <v-icon start>mdi-view-dashboard</v-icon> Overview
          </v-tab>

          <v-tab value="approvals" class="justify-start px-6">
            <v-badge
              :content="authStore.pendingRequests.length"
              :model-value="authStore.pendingRequests.length > 0"
              color="error"
              offset-x="-10"
            >
              <v-icon start>mdi-account-clock</v-icon> Approvals
            </v-badge>
          </v-tab>

          <v-tab value="employees" class="justify-start px-6">
            <v-icon start>mdi-account-group</v-icon> Employees
          </v-tab>

          <v-tab value="payslips" class="justify-start px-6">
            <v-icon start>mdi-file-document-outline</v-icon> Payslips
          </v-tab>

          <v-tab value="settings" class="justify-start px-6">
            <v-icon start>mdi-cog</v-icon> Settings
          </v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab" class="content-area pa-6">
          <v-tabs-window-item value="dashboard">
            <h2 class="text-h5 font-weight-bold mb-6">System Overview</h2>
            <v-row>
              <v-col cols="12" md="4">
                <v-card
                  class="pa-4 rounded-xl border-s-xl"
                  style="border-inline-start-color: #1867c0 !important"
                >
                  <div class="text-overline text-grey">Total Employees</div>
                  <div class="text-h4 font-weight-bold">
                    {{ employeeStore.employees.length }}
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="4">
                <v-card
                  class="pa-4 rounded-xl border-s-xl"
                  style="border-inline-start-color: #ff5252 !important"
                >
                  <div class="text-overline text-grey">Pending Approvals</div>
                  <div class="text-h4 font-weight-bold">
                    {{ authStore.pendingRequests.length }}
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <v-alert
              v-if="authStore.pendingRequests.length > 0"
              type="warning"
              variant="tonal"
              class="mt-6 rounded-lg"
              title="Action Required"
              text="New employees are waiting for system access. Head to the Approvals tab to review them."
            >
              <template v-slot:append>
                <v-btn
                  color="warning"
                  variant="flat"
                  size="small"
                  @click="tab = 'approvals'"
                  >Go to Approvals</v-btn
                >
              </template>
            </v-alert>
          </v-tabs-window-item>

          <v-tabs-window-item value="approvals">
            <div class="d-flex align-center justify-space-between mb-6">
              <div>
                <h2 class="text-h5 font-weight-bold">Access Requests</h2>
                <p class="text-body-2 text-grey">
                  Review and approve new employee registrations
                </p>
              </div>
              <v-btn
                prepend-icon="mdi-refresh"
                variant="outlined"
                color="primary"
                @click="authStore.fetchPendingRequests"
                :loading="authStore.loading"
              >
                Refresh List
              </v-btn>
            </div>

            <v-card border flat class="rounded-xl">
              <v-data-table
                :headers="approvalHeaders"
                :items="authStore.pendingRequests"
                :loading="authStore.loading"
              >
                <template #item.name="{ item }">
                  <div class="font-weight-bold">
                    {{ item.firstName }} {{ item.lastName }}
                  </div>
                </template>

                <template #item.status="{ item }">
                  <v-chip
                    color="orange"
                    size="small"
                    variant="tonal"
                    class="text-uppercase font-weight-bold"
                  >
                    {{ item.status }}
                  </v-chip>
                </template>

                <template #item.actions="{ item }">
                  <v-btn
                    color="success"
                    variant="flat"
                    size="small"
                    prepend-icon="mdi-check"
                    class="rounded-lg px-4"
                    @click="processApproval(item._id)"
                    :loading="authStore.loading"
                  >
                    Approve
                  </v-btn>
                </template>

                <template #no-data>
                  <div class="pa-12 text-center">
                    <v-icon size="80" color="grey-lighten-2"
                      >mdi-account-check</v-icon
                    >
                    <div class="text-h6 text-grey-darken-1 mt-4">
                      All Clear!
                    </div>
                    <div class="text-body-2 text-grey">
                      There are no pending requests to process.
                    </div>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </v-tabs-window-item>

          <v-tabs-window-item value="employees">
            <h2 class="text-h5 font-weight-bold mb-6">Employee Directory</h2>
            <v-card border flat class="rounded-xl">
              <v-data-table
                :items="employeeStore.employees"
                :headers="employeeHeaders"
              >
                <template #item.fullName="{ item }">
                  <div class="d-flex align-center">
                    <v-avatar size="32" color="primary-lighten-4" class="mr-3">
                      <span class="text-caption text-primary">
                        {{ item.firstName[0] }}{{ item.lastName[0] }}
                      </span>
                    </v-avatar>
                    <span class="font-weight-medium">
                      {{ item.firstName }} {{ item.lastName }}
                    </span>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </v-tabs-window-item>

          <v-window-item value="payslips">
            <v-row class="mb-4">
              <v-col
                v-for="stat in payrollStats"
                :key="stat.label"
                cols="12"
                md="4"
              >
                <v-card
                  variant="outlined"
                  class="pa-4"
                  :loading="payrollStore.loading"
                >
                  <div class="text-overline text-medium-emphasis">
                    {{ stat.label }}
                  </div>
                  <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
                  <v-chip
                    v-if="stat.trend"
                    :color="stat.trendColor"
                    size="x-small"
                    class="mt-1"
                    variant="tonal"
                  >
                    {{ stat.trend }}
                  </v-chip>
                </v-card>
              </v-col>
            </v-row>

            <div class="d-flex justify-space-between align-center mb-6">
              <div>
                <h3 class="text-h6 font-weight-bold">Payroll Administration</h3>
                <p class="text-caption text-medium-emphasis">
                  Current Cycle: April 2026
                </p>
              </div>

              <div class="d-flex ga-2">
                <v-btn
                  color="secondary"
                  variant="outlined"
                  prepend-icon="mdi-export"
                  @click="exportBankFile"
                >
                  Export Bank File
                </v-btn>

                <v-btn
                  color="primary"
                  prepend-icon="mdi-calculator"
                  :loading="payrollStore.loading"
                  @click="confirmGeneratePayroll"
                >
                  Generate All
                </v-btn>
              </div>
            </div>

            <v-card variant="outlined">
              <v-data-table
                :headers="payrollHeaders"
                :items="payrollStore.payrollHistory"
                :loading="payrollStore.loading"
                hover
              >
                <template #item.employeeName="{ item }">
                  <span class="font-weight-medium"
                    >{{ item.firstName }} {{ item.lastName }}</span
                  >
                </template>

                <template #item.status="{ value }">
                  <v-chip
                    :color="getStatusColor(value)"
                    size="small"
                    variant="flat"
                    class="text-uppercase font-weight-bold"
                    style="font-size: 10px"
                  >
                    {{ value }}
                  </v-chip>
                </template>

                <template #item.actions="{ item }">
                  <v-tooltip text="View Breakdown" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-eye-outline"
                        variant="text"
                        color="grey-darken-1"
                        size="small"
                        @click="viewDetails(item)"
                      ></v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip text="Download PDF" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon="mdi-download"
                        variant="text"
                        color="primary"
                        size="small"
                        @click="payrollStore.downloadPdf(item._id)"
                      ></v-btn>
                    </template>
                  </v-tooltip>
                </template>

                <template #no-data>
                  <div class="pa-8 text-center">
                    <v-icon
                      icon="mdi-history"
                      size="large"
                      color="grey"
                      class="mb-2"
                    ></v-icon>
                    <p>No payroll records found for this period.</p>
                  </div>
                </template>
              </v-data-table>
            </v-card>
          </v-window-item>
        </v-tabs-window>
      </div>
    </v-card>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" elevation="24">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useEmployeeStore } from "@/stores/employee";
import { usePayrollStore } from "@/stores/payroll";
import Swal from "sweetalert2";

const authStore = useAuthStore();
const employeeStore = useEmployeeStore();
const payrollStore = usePayrollStore();

const tab = ref("dashboard");
const snackbar = reactive({ show: false, text: "", color: "success" });

// Table Headers
const approvalHeaders = [
  { title: "Employee Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions", align: "end", sortable: false },
];

const employeeHeaders = [
  { title: "Employee Name", key: "fullName" }, // The custom key
  { title: "Position", key: "position" },
  { title: "Department", key: "department" },
];

onMounted(async () => {
  try {
    // 1. Fetch pending requests for the badge and table
    await authStore.fetchPendingRequests();
    // 2. Fetch existing employees for the overview stats
    await employeeStore.fetchEmployees();
  } catch (err) {
    showNotify("Error loading dashboard data", "error");
  }
});

const processApproval = async (id) => {
  const result = await Swal.fire({
    title: "Approve Employee?",
    text: "This will create a user account and grant them system access.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#4CAF50",
    confirmButtonText: "Yes, Approve",
  });

  if (result.isConfirmed) {
    try {
      await authStore.approveEmployee(id);
      showNotify("Employee approved successfully!");
    } catch (err) {
      showNotify(err.message || "Approval failed", "error");
    }
  }
};

const handleLogout = () => {
  authStore.logout();
};

const showNotify = (text, color = "success") => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
};
</script>

<style scoped>
.fill-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.full-width {
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
}

.content-area {
  flex: 1;
  overflow-y: auto;
}

/* Custom transitions for side tabs */
.v-tab--selected {
  background-color: rgba(24, 103, 192, 0.05);
  font-weight: bold;
}
</style>
