<template>
  <v-container fluid class="fill-height bg-grey-lighten-3">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <div class="text-center mb-6">
          <v-icon
            icon="mdi-cash-register"
            size="64"
            color="primary"
            class="mb-2"
          ></v-icon>
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">
            PayRoll Pro
          </h1>
          <p class="text-body-2 text-medium-emphasis">
            Secure Enterprise Portal Access
          </p>
        </div>

        <v-card elevation="12" rounded="xl">
          <v-tabs v-model="tab" bg-color="primary" align-tabs="center" grow>
            <v-tab value="login" class="text-capitalize">
              <v-icon start>mdi-login</v-icon> Login
            </v-tab>
            <v-tab value="signup" class="text-capitalize">
              <v-icon start>mdi-account-plus</v-icon> Register
            </v-tab>
          </v-tabs>

          <v-tabs-window v-model="tab">
            <v-tabs-window-item value="login">
              <v-card-text class="pa-8">
                <v-form @submit.prevent="handleLogin">
                  <div class="text-subtitle-2 font-weight-bold mb-1">
                    Company Email
                  </div>
                  <v-text-field
                    v-model="loginForm.email"
                    placeholder="name@company.com"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    type="email"
                    required
                  ></v-text-field>

                  <div class="text-subtitle-2 font-weight-bold mb-1 d-flex justify-space-between">
                    Password
                    <a href="#" class="text-caption text-primary text-decoration-none">Forgot?</a>
                  </div>
                  <v-text-field
                    v-model="loginForm.password"
                    :type="visible ? 'text' : 'password'"
                    placeholder="Enter your password"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    @click:append-inner="visible = !visible"
                    required
                  ></v-text-field>

                  <v-btn
                    block
                    size="large"
                    color="primary"
                    elevation="2"
                    class="mt-2 font-weight-bold"
                    rounded="lg"
                    :loading="authStore.loading"
                    type="submit"
                  >
                    SIGN IN
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-tabs-window-item>

            <v-tabs-window-item value="signup">
              <v-card-text class="pa-8">
                <v-form @submit.prevent="handleRequestAccess">
                  <div class="text-subtitle-2 font-weight-bold mb-1">
                    Full Name
                  </div>
                  <v-text-field
                    v-model="regForm.fullName"
                    placeholder="John Doe"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    density="comfortable"
                    required
                  ></v-text-field>

                  <div class="text-subtitle-2 font-weight-bold mb-1">
                    Work Email
                  </div>
                  <v-text-field
                    v-model="regForm.email"
                    placeholder="name@company.com"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    density="comfortable"
                    type="email"
                    required
                  ></v-text-field>

                  <v-btn
                    block
                    size="large"
                    color="success"
                    class="font-weight-bold"
                    rounded="lg"
                    :loading="authStore.loading"
                    type="submit"
                  >
                    REQUEST ACCESS
                  </v-btn>
                </v-form>
                
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mt-4 text-caption"
                >
                  Registration requires HR approval before you can sign in.
                </v-alert>
              </v-card-text>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card>

        <div class="text-center mt-6 text-grey">
          <small>&copy; 2026 PayRoll Pro System • Version 1.2.0</small>
        </div>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth"; // Ensure this path matches your project structure

// Initialize Store and Router
const authStore = useAuthStore();
const router = useRouter();

// UI State
const tab = ref("login");
const visible = ref(false);
const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
});

// Form Models
const loginForm = reactive({
  email: "",
  password: "",
});

const regForm = reactive({
  fullName: "",
  email: "",
});

// Helper for UI notifications
const notify = (text, color = "success") => {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
};

/**
 * 1. HANDLE LOGIN
 * Logic for Admin, HR, and Employees
 */
const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    return notify("Please fill in all fields", "error");
  }

  try {
    const data = await authStore.login(loginForm);
    
    // Safety check for user role
    if (!data.user || !data.user.role) {
      throw new Error("User data is incomplete. Contact Admin.");
    }

    const role = data.user.role.toLowerCase();
    notify("Login successful! Redirecting...", "success");

    // ROLE-BASED REDIRECTION
    if (role === "admin") {
      router.push("/admin");
    } else if (role === "hr") {
      router.push("/hr");
    } else if (role === "employee") {
      router.push("/employee");
    } else {
      notify("Unknown role. Redirecting to home.", "warning");
      router.push("/");
    }
    
  } catch (error) {
    // Axios usually buries the error message in error.response.data
    const message = error.response?.data?.message || error.message || "Invalid credentials";
    notify(message, "error");
  }
};

/**
 * 2. HANDLE REQUEST ACCESS
 */
const handleRequestAccess = async () => {
  if (!regForm.fullName || !regForm.email) {
    return notify("Please fill in all fields", "error");
  }

  try {
    await authStore.requestAccess({
      fullName: regForm.fullName,
      email: regForm.email
    });

    notify("Access request sent to HR successfully!", "success");

    // Reset registration form and move to login tab
    regForm.fullName = "";
    regForm.email = "";
    tab.value = "login";
  } catch (error) {
    const message = error.response?.data?.message || "Could not submit request";
    notify(message, "error");
  }
};
</script>

<style scoped>
.v-card {
  transition: transform 0.2s ease-in-out;
}
/* Optional: slightly lift card on focus */
.v-card:focus-within {
  transform: translateY(-5px);
}
</style>