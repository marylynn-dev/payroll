<template>
  <v-container fluid>
    <v-card flat class="fill-screen">
      <div class="d-flex align-center justify-space-between mb-6">
        <h2 class="text-h5 font-weight-medium">Employee Dashboard</h2>
        <div class="d-flex align-center">
          <v-avatar size="40" class="mr-2" color="primary" variant="flat">
            <template v-if="dashboard.employee?.avatar">
              <v-img :src="dashboard.employee.avatar" />
            </template>
            <template v-else>
              <span class="text-white font-weight-medium">
                {{
                  (dashboard.employee?.firstName?.[0] || "").toUpperCase() +
                  (dashboard.employee?.lastName?.[0] || "").toUpperCase()
                }}
              </span>
            </template>
          </v-avatar>
          <span class="font-weight-medium mr-10"
            >{{ dashboard.employee?.firstName }}
            {{ dashboard.employee?.lastName }}
          </span>
        </div>
      </div>

      <div class="d-flex flex-row full-width">
        <!-- Sidebar -->
        <v-tabs
          v-model="tab"
          color="primary"
          direction="vertical"
          class="sidebar"
        >
          <v-tab
            prepend-icon="mdi-account"
            text="Dashboard"
            value="dashboard"
          />
          <v-tab prepend-icon="mdi-lock" text="Payslips" value="payslips" />
          <v-tab
            prepend-icon="mdi-account-circle"
            text="Profile"
            value="profile"
          />
          <v-tab prepend-icon="mdi-cog" text="Settings" value="settings" />
        </v-tabs>

        <!-- Main Content -->
        <v-tabs-window v-model="tab" class="content-area">
          <!-- Dashboard -->
          <v-tabs-window-item value="dashboard">
            <v-card flat class="pa-6">
              <!-- Stats -->
              <v-row class="mb-6" dense>
                <v-col cols="12" md="4">
                  <v-card class="pa-4 text-left rounded-lg elevation-0 border">
                    <div class="text-caption text-grey">Last Salary</div>
                    <div class="text-h5 font-weight-bold">
                      Ksh {{ dashboard.latestPayslip?.netSalary }}
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card class="pa-4 text-left rounded-lg elevation-0 border">
                    <div class="text-caption text-grey">Latest Payslip</div>
                    <v-btn
                      color="primary"
                      variant="tonal"
                      density="comfortable"
                      @click="
                        dashboard.downloadPayslip(dashboard.latestPayslip?._id)
                      "
                    >
                      Download
                    </v-btn>
                  </v-card>
                </v-col>

                <v-col cols="12" md="4">
                  <v-card class="pa-4 text-left rounded-lg elevation-0 border">
                    <div class="text-caption text-grey">Upcoming Payday</div>
                    <div>
                      <span class="text-h5 font-weight-bold">
                        {{ paydayInfo.daysRemaining }} days</span
                      >
                      &nbsp;
                      <span class="text-caption text-grey">
                        {{ paydayInfo.nextPayday }}</span
                      >
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Payslips Table -->
              <v-card class="pa-4 rounded-lg elevation-0 border">
                <div class="d-flex align-center justify-space-between mb-3">
                  <h3 class="text-h6 font-weight-medium">Payslips</h3>
                </div>
                <v-data-table
                  :headers="headers"
                  :items="dashboard.payrollHistory"
                  :loading="dashboard.loading"
                  class="elevation-0"
                  dense
                  hide-default-footer
                >
                  <template #item.generatedAt="{ item }">
                    {{ new Date(item.generatedAt).toLocaleDateString() }}
                  </template>

                  <template #item.month="{ item }">
                    {{
                      new Date(item.generatedAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    }}
                  </template>

                  <template #item.actions="{ item }">
                    <v-btn
                      color="primary"
                      variant="tonal"
                      density="comfortable"
                      @click="dashboard.downloadPayslip(item._id)"
                    >
                      Download
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card>
            </v-card>
          </v-tabs-window-item>

          <!-- Payslips -->
          <v-tabs-window-item value="payslips">
            <v-card flat class="pa-6">
              <h3 class="text-h6 font-weight-medium mb-4">Payslips</h3>
              <v-data-table
                :headers="headers"
                :items="dashboard.payrollHistory"
                :loading="dashboard.loading"
                class="elevation-0"
                dense
                hide-default-footer
              >
                <template #item.generatedAt="{ item }">
                  {{ new Date(item.generatedAt).toLocaleDateString() }}
                </template>

                <template #item.month="{ item }">
                  {{
                    new Date(item.generatedAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  }}
                </template>

                <template #item.actions="{ item }">
                  <v-btn
                    color="primary"
                    variant="tonal"
                    density="comfortable"
                    @click="dashboard.downloadPayslip(item._id)"
                  >
                    Download
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>
          </v-tabs-window-item>

          <!-- Profile -->
          <v-tabs-window-item value="profile">
            <v-card flat class="pa-6">
              <v-card-text>
                <p>
                  <strong>Name:</strong>
                  {{ dashboard.employee?.firstName }}
                  {{ dashboard.employee?.lastName }}
                  <br />
                  <strong>Email:</strong> {{ dashboard.employee?.email }} <br />
                  <strong>Department:</strong>
                  {{ dashboard.employee?.department }}
                  <br />
                  <strong>Position:</strong> {{ dashboard.employee?.position }}
                </p>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>

          <!-- Settings -->
          <v-tabs-window-item value="settings">
            <v-card flat class="pa-6">
              <p>Settings content goes here.</p>
            </v-card>
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useEmployeeDashboard } from "@/stores/employee";
import { getDaysUntilPayday } from "@/utils/payday";

const tab = ref("dashboard");
const dashboard = useEmployeeDashboard();
const employeeId = "68debbe7b15306e5017d1a1b"; // Example

const paydayInfo = getDaysUntilPayday();

// Auto-load data on mount
onMounted(async () => {
  localStorage.setItem(
    "token",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjIyNTAxNjAsImV4cCI6MTc2MjI1Mzc2MCwiYXVkIjoidW5kZWZpbmVkIiwiaXNzIjoibWUuY29tIn0.z3GtmEE2_lKuIsvVozP7jxrN3yUdLyrf_U8RVMYBHLI"
  );

  await dashboard.fetchEmployeeById(employeeId);
  await dashboard.fetchPayrollHistory(employeeId);
  await dashboard.fetchlatestPayslip(employeeId);
});

// Optional: refresh payslips when user switches to "payslips" tab
// watch(tab, async (newTab) => {
//   if (newTab === "payslips") {
//     await dashboard.fetchPayrollHistory(employeeId);
//   }
// });

const headers = [
  { title: "Month", value: "month" },
  { title: "Payment Date", value: "generatedAt" },
  { title: "Payslip", value: "actions", align: "end" },
];
</script>

<style scoped>
.fill-screen {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.full-width {
  width: 100%;
  height: calc(100vh - 64px);
}

.sidebar {
  width: 250px;
  border-right: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  background-color: white;
}

.border {
  border: 1px solid #e0e0e0;
}
</style>
