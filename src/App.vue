<script setup>
  import { ref, computed, onMounted } from "vue";
  import { useToast } from "@/composables/useToast";
  import AdminSidebar from "@/views/AdminSidebar.vue";
  import AdminTopBar from "@/views/AdminTopBar.vue";
  import DashboardView from "@/views/DashboardView.vue";
  import SubjectsView from "@/views/SubjectsView.vue";
  import TestsView from "@/views/TestsView.vue";
  import QuestionsView from "@/views/QuestionsView.vue";
  import AttemptsView from "@/views/AttemptsView.vue";
  import SettingsView from "@/views/SettingsView.vue";

  const { toasts, dismiss } = useToast();

  const pageMap = {
    "practice-test-manager": "dashboard",
    "ptm-subjects": "subjects",
    "ptm-tests": "tests",
    "ptm-questions": "questions",
    "ptm-results": "results",
    "ptm-settings": "settings",
  };

  // Reverse map: view → WP page slug
  const viewToPage = Object.fromEntries(
    Object.entries(pageMap).map(([page, view]) => [view, page]),
  );

  const initialPage =
    window.ptmAdminData?.currentPage || "practice-test-manager";
  const activeView = ref(pageMap[initialPage] || "dashboard");

  const viewComponents = {
    dashboard: DashboardView,
    subjects: SubjectsView,
    tests: TestsView,
    questions: QuestionsView,
    results: AttemptsView,
    settings: SettingsView,
  };

  const currentComponent = computed(() => viewComponents[activeView.value]);

  function navigate(view) {
    activeView.value = view;

    // URL আপডেট করো (page reload ছাড়া)
    const url = new URL(window.location.href);
    url.searchParams.set("page", viewToPage[view]);
    window.history.pushState({ view }, "", url.toString());
  }

  onMounted(() => {
    // Browser back/forward বাটন support
    window.addEventListener("popstate", (e) => {
      const url = new URL(window.location.href);
      const page = url.searchParams.get("page") || "practice-test-manager";
      activeView.value = pageMap[page] || "dashboard";
    });
  });
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <AdminSidebar :active="activeView" @navigate="navigate" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <AdminTopBar :active="activeView" />
      <main class="flex-1 overflow-y-auto p-4">
        <component :is="currentComponent" />
      </main>
    </div>
  </div>

  <!-- Toast notifications -->
  <Teleport to="body">
    <div
      class="fixed bottom-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-none"
    >
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm pointer-events-auto transition',
            toast.type === 'success'
              ? 'bg-white border-green-300 text-green-800'
              : toast.type === 'error'
                ? 'bg-white border-red-300 text-red-700'
                : 'bg-white border-blue-300 text-blue-800',
          ]"
        >
          <span>
            {{
              toast.type === "success"
                ? "✓"
                : toast.type === "error"
                  ? "✗"
                  : "ℹ"
            }}
          </span>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            @click="dismiss(toast.id)"
            class="opacity-50 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<style scoped>
  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }
  .toast-enter-from,
  .toast-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
</style>
