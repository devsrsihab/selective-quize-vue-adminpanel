<script setup>
  // admin/js/admin-app/src/views/DashboardView.vue
  import { onMounted, computed } from "vue";
  import { useAdminStore } from "@/stores/adminStore";
  import { Bar, Line, Doughnut } from "vue-chartjs";
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
  );

  const store = useAdminStore();

  onMounted(async () => {
    await Promise.all([
      store.fetchDashboardStats(),
      store.fetchDashboardCharts(),
    ]);
  });

  const stats = computed(() => store.dashboardStats);
  const charts = computed(() => store.dashboardCharts);

  // ── Chart data ───────────────────────────────────────────────

  const attemptsPerSubjectData = computed(() => ({
    labels: charts.value.attempts_per_subject?.map((r) => r.label) || [],
    datasets: [
      {
        label: "Attempts",
        data: charts.value.attempts_per_subject?.map((r) => r.value) || [],
        backgroundColor: "#1a56db",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }));

  const dailyAttemptsData = computed(() => ({
    labels: charts.value.daily_attempts?.map((r) => r.label) || [],
    datasets: [
      {
        label: "Daily Attempts",
        data: charts.value.daily_attempts?.map((r) => r.value) || [],
        borderColor: "#1a56db",
        backgroundColor: "rgba(26,86,219,0.07)",
        fill: true,
        tension: 0.45,
        pointRadius: 4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#1a56db",
        pointBorderWidth: 2,
      },
    ],
  }));

  const scoreDistData = computed(() => {
    const d = charts.value.score_distribution || {};
    return {
      labels: ["0–25%", "26–50%", "51–75%", "76–100%"],
      datasets: [
        {
          data: [
            d["0-25"] || 0,
            d["26-50"] || 0,
            d["51-75"] || 0,
            d["76-100"] || 0,
          ],
          backgroundColor: ["#ef4444", "#f59e0b", "#facc15", "#22c55e"],
          borderWidth: 3,
          borderColor: "#fff",
        },
      ],
    };
  });

  const avgScoreData = computed(() => ({
    labels: charts.value.avg_score_per_test?.map((r) => r.label) || [],
    datasets: [
      {
        label: "Avg Score %",
        data:
          charts.value.avg_score_per_test?.map(
            (r) => Math.round(r.value * 10) / 10,
          ) || [],
        backgroundColor: "#0d9488",
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }));

  // Shared chart.js options
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "Plus Jakarta Sans", size: 11 },
          color: "#94a3b8",
        },
        border: { color: "#e2e8f0" },
      },
      y: {
        grid: { color: "#f1f5f9", drawBorder: false },
        ticks: {
          font: { family: "Plus Jakarta Sans", size: 11 },
          color: "#94a3b8",
        },
        border: { dash: [4, 4], color: "transparent" },
      },
    },
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        display: true,
        position: "right",
        labels: {
          font: { family: "Plus Jakarta Sans", size: 12 },
          color: "#475569",
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 3,
          padding: 14,
        },
      },
    },
  };

  // ── Stat card definitions ────────────────────────────────────
  // icon = Material Symbols Rounded ligature name
  const statCards = computed(() => [
    {
      label: "Subjects",
      value: stats.value.total_subjects || 0,
      icon: "menu_book",
      mod: "subjects",
    },
    {
      label: "Tests",
      value: stats.value.total_tests || 0,
      icon: "assignment",
      mod: "tests",
    },
    {
      label: "Questions",
      value: stats.value.total_questions || 0,
      icon: "quiz",
      mod: "questions",
    },
    {
      label: "Attempts",
      value: stats.value.total_attempts || 0,
      icon: "edit_note",
      mod: "attempts",
    },
    {
      label: "Completed",
      value: stats.value.completed_attempts || 0,
      icon: "task_alt",
      mod: "completed",
    },
    {
      label: "Avg Score",
      value: `${Math.round(stats.value.avg_score_pct || 0)}%`,
      icon: "bar_chart",
      mod: "avgscore",
    },
  ]);

  function formatDate(dt) {
    return dt ? new Date(dt).toLocaleDateString() : "—";
  }
</script>

<template>
  <div class="dashboard">
    <!-- ── Stat Cards ── -->
    <div class="stat-grid">
      <div
        v-for="card in statCards"
        :key="card.label"
        :class="['stat-card', `stat-card--${card.mod}`]"
      >
        <div class="stat-card__icon-wrap">
          <!-- Material Symbols Rounded: render via ligature text node -->
          <span class="ms">{{ card.icon }}</span>
        </div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ card.value }}</span>
          <span class="stat-card__label">{{ card.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── Charts ── -->
    <div class="chart-grid">
      <!-- Attempts by Subject -->
      <div class="panel">
        <div class="panel__header">
          <div class="panel__icon-wrap">
            <span class="ms">analytics</span>
          </div>
          <div class="panel__meta">
            <div class="panel__title">Attempts by Subject</div>
            <div class="panel__subtitle">Last 30 days</div>
          </div>
        </div>
        <div class="panel__chart-area">
          <Bar :data="attemptsPerSubjectData" :options="baseChartOptions" />
        </div>
      </div>

      <!-- Daily Attempts -->
      <div class="panel">
        <div class="panel__header">
          <div class="panel__icon-wrap">
            <span class="ms">trending_up</span>
          </div>
          <div class="panel__meta">
            <div class="panel__title">Daily Attempts</div>
            <div class="panel__subtitle">Last 14 days</div>
          </div>
        </div>
        <div class="panel__chart-area">
          <Line :data="dailyAttemptsData" :options="baseChartOptions" />
        </div>
      </div>

      <!-- Score Distribution -->
      <div class="panel">
        <div class="panel__header">
          <div class="panel__icon-wrap">
            <span class="ms">donut_large</span>
          </div>
          <div class="panel__meta">
            <div class="panel__title">Score Distribution</div>
            <div class="panel__subtitle">All attempts</div>
          </div>
        </div>
        <div class="panel__chart-area panel__chart-area--donut">
          <Doughnut :data="scoreDistData" :options="donutOptions" />
        </div>
      </div>

      <!-- Avg Score per Test -->
      <div class="panel">
        <div class="panel__header">
          <div class="panel__icon-wrap">
            <span class="ms">leaderboard</span>
          </div>
          <div class="panel__meta">
            <div class="panel__title">Average Score per Test</div>
            <div class="panel__subtitle">Percentage</div>
          </div>
        </div>
        <div class="panel__chart-area">
          <Bar :data="avgScoreData" :options="baseChartOptions" />
        </div>
      </div>
    </div>

    <!-- ── Recent Attempts ── -->
    <div class="panel panel--table">
      <div class="panel__header">
        <div class="panel__icon-wrap">
          <span class="ms">history_edu</span>
        </div>
        <div class="panel__meta">
          <div class="panel__title" style="font-size: 15px">
            Recent Attempts
          </div>
        </div>
      </div>

      <div class="table-scroll">
        <table class="attempts-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Student</th>
              <th>Date</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in charts.recent_attempts || []" :key="row.id">
              <td class="td--name">{{ row.test_name }}</td>
              <td class="td--muted">{{ row.student_name || "Guest" }}</td>
              <td class="td--muted">{{ formatDate(row.started_at) }}</td>
              <td class="td--score">
                {{ row.total_score ?? "—" }} / {{ row.max_score ?? "—" }}
              </td>
              <td>
                <span
                  :class="[
                    'badge',
                    row.status === 'completed'
                      ? 'badge--completed'
                      : 'badge--pending',
                  ]"
                >
                  <span class="ms">
                    {{
                      row.status === "completed" ? "check_circle" : "pending"
                    }}
                  </span>
                  {{ row.status }}
                </span>
              </td>
            </tr>

            <tr v-if="!charts.recent_attempts?.length" class="table-empty">
              <td colspan="5">
                <span class="ms">inbox</span>
                <span>No attempts yet.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "@/styles/Dashboardview.scss";
</style>
