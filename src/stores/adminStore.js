// admin/js/admin-app/src/stores/adminStore.js
import { defineStore } from "pinia";
import { ref } from "vue";
import adminApiClient from "@/composables/useApi";

export const useAdminStore = defineStore("admin", () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const subjects = ref([]);
  const tests = ref([]);
  const questions = ref([]);
  const attempts = ref([]);
  const dashboardStats = ref({});
  const dashboardCharts = ref({});
  const settings = ref({});

  const selectedSubjectFilter = ref(null);
  const selectedTestFilter = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  async function request(fn) {
    loading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // ── Subjects ───────────────────────────────────────────────────────────────
  async function fetchSubjects() {
    return request(async () => {
      const res = await adminApiClient.get("/admin/subjects");
      subjects.value = res.data.items;
      return res;
    });
  }

  async function createSubject(data) {
    return request(async () => {
      const res = await adminApiClient.post("/admin/subjects", data);
      await fetchSubjects();
      return res;
    });
  }

  async function updateSubject(id, data) {
    return request(async () => {
      const res = await adminApiClient.put(`/admin/subjects/${id}`, data);
      await fetchSubjects();
      return res;
    });
  }

  async function deleteSubject(id) {
    return request(async () => {
      const res = await adminApiClient.delete(`/admin/subjects/${id}`);
      await fetchSubjects();
      return res;
    });
  }

  // ── Tests ──────────────────────────────────────────────────────────────────
  async function fetchTests(subjectId = null) {
    return request(async () => {
      const params = subjectId ? { subject_id: subjectId } : {};
      const res = await adminApiClient.get("/admin/tests", { params });
      tests.value = res.data.items;
      return res;
    });
  }

  async function createTest(data) {
    return request(async () => {
      const res = await adminApiClient.post("/admin/tests", data);
      await fetchTests();
      return res;
    });
  }

  async function updateTest(id, data) {
    return request(async () => {
      const res = await adminApiClient.put(`/admin/tests/${id}`, data);
      await fetchTests();
      return res;
    });
  }

  async function deleteTest(id) {
    return request(async () => {
      const res = await adminApiClient.delete(`/admin/tests/${id}`);
      await fetchTests();
      return res;
    });
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  async function fetchQuestions(testId = null) {
    return request(async () => {
      const params = testId ? { test_id: testId } : {};
      const res = await adminApiClient.get("/admin/questions", { params });
      questions.value = res.data.items;
      return res;
    });
  }

  async function createQuestion(data) {
    return request(async () => {
      const res = await adminApiClient.post("/admin/questions", data);
      await fetchQuestions(data.test_id);
      return res;
    });
  }

  async function updateQuestion(id, data) {
    return request(async () => {
      const res = await adminApiClient.put(`/admin/questions/${id}`, data);
      await fetchQuestions();
      return res;
    });
  }

  async function duplicateQuestion(id) {
    return request(async () => {
      const res = await adminApiClient.post(`/admin/questions/${id}/duplicate`);
      await fetchQuestions();
      return res;
    });
  }

  async function deleteQuestion(id) {
    return request(async () => {
      const res = await adminApiClient.delete(`/admin/questions/${id}`);
      await fetchQuestions();
      return res;
    });
  }

  // ── Attempts ───────────────────────────────────────────────────────────────
  async function fetchAttempts(params = {}) {
    return request(async () => {
      const res = await adminApiClient.get("/admin/attempts", { params });
      attempts.value = res.data.items;
      return res;
    });
  }

  async function fetchAttemptDetail(id) {
    return request(async () => {
      const res = await adminApiClient.get(`/admin/attempts/${id}`);
      return res.data;
    });
  }

  async function updateWritingMark(attemptId, questionId, marksAwarded) {
    return request(async () => {
      return adminApiClient.put(`/admin/attempts/${attemptId}/mark`, {
        question_id: questionId,
        marks_awarded: marksAwarded,
      });
    });
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  async function fetchDashboardStats() {
    return request(async () => {
      const res = await adminApiClient.get("/admin/dashboard/stats");
      dashboardStats.value = res.data;
      return res;
    });
  }

  async function fetchDashboardCharts() {
    return request(async () => {
      const res = await adminApiClient.get("/admin/dashboard/charts");
      dashboardCharts.value = res.data;
      return res;
    });
  }

  // ── Settings ───────────────────────────────────────────────────────────────
  async function fetchSettings() {
    return request(async () => {
      const res = await adminApiClient.get("/admin/settings");
      settings.value = res.data;
      return res;
    });
  }

  async function saveSettings(data) {
    return request(async () => {
      const res = await adminApiClient.put("/admin/settings", data);
      await fetchSettings();
      return res;
    });
  }

  return {
    subjects,
    tests,
    questions,
    attempts,
    dashboardStats,
    dashboardCharts,
    settings,
    selectedSubjectFilter,
    selectedTestFilter,
    loading,
    error,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    fetchTests,
    createTest,
    updateTest,
    deleteTest,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    duplicateQuestion,
    deleteQuestion,
    fetchAttempts,
    fetchAttemptDetail,
    updateWritingMark,
    fetchDashboardStats,
    fetchDashboardCharts,
    fetchSettings,
    saveSettings,
  };
});
