<script setup>
// admin/js/admin-app/src/views/DashboardView.vue
import { onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { Bar, Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend)

const store = useAdminStore()

onMounted(async () => {
  await Promise.all([store.fetchDashboardStats(), store.fetchDashboardCharts()])
})

const stats = computed(() => store.dashboardStats)
const charts = computed(() => store.dashboardCharts)

// Attempts per subject chart.
const attemptsPerSubjectData = computed(() => ({
  labels: charts.value.attempts_per_subject?.map(r => r.label) || [],
  datasets: [{
    label: 'Attempts',
    data: charts.value.attempts_per_subject?.map(r => r.value) || [],
    backgroundColor: '#1B3A6B',
  }],
}))

// Daily attempts line chart.
const dailyAttemptsData = computed(() => ({
  labels: charts.value.daily_attempts?.map(r => r.label) || [],
  datasets: [{
    label: 'Daily Attempts',
    data: charts.value.daily_attempts?.map(r => r.value) || [],
    borderColor: '#2D5090',
    backgroundColor: 'rgba(45,80,144,0.1)',
    fill: true,
    tension: 0.4,
  }],
}))

// Score distribution donut.
const scoreDistData = computed(() => {
  const d = charts.value.score_distribution || {}
  return {
    labels: ['0–25%', '26–50%', '51–75%', '76–100%'],
    datasets: [{
      data: [d['0-25'] || 0, d['26-50'] || 0, d['51-75'] || 0, d['76-100'] || 0],
      backgroundColor: ['#E53E3E', '#E67E22', '#ECC94B', '#38A169'],
    }],
  }
})

// Avg score per test chart.
const avgScoreData = computed(() => ({
  labels: charts.value.avg_score_per_test?.map(r => r.label) || [],
  datasets: [{
    label: 'Avg Score %',
    data: charts.value.avg_score_per_test?.map(r => Math.round(r.value * 10) / 10) || [],
    backgroundColor: '#38B2AC',
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
}

const statCards = computed(() => [
  { label: 'Subjects',    value: stats.value.total_subjects    || 0, icon: '📚' },
  { label: 'Tests',       value: stats.value.total_tests       || 0, icon: '📋' },
  { label: 'Questions',   value: stats.value.total_questions   || 0, icon: '❓' },
  { label: 'Attempts',    value: stats.value.total_attempts    || 0, icon: '📝' },
  { label: 'Completed',   value: stats.value.completed_attempts || 0, icon: '✅' },
  { label: 'Avg Score',   value: `${Math.round(stats.value.avg_score_pct || 0)}%`, icon: '📊' },
])

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleDateString() : '—'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Stats cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="ptm-card flex flex-col items-center text-center py-5"
      >
        <span class="text-3xl mb-1">{{ card.icon }}</span>
        <span class="text-2xl font-bold text-ptm-navy">{{ card.value }}</span>
        <span class="text-xs text-ptm-gray mt-0.5">{{ card.label }}</span>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="ptm-card">
        <h3 class="text-sm font-semibold text-ptm-gray mb-4">Attempts by Subject (last 30 days)</h3>
        <div class="h-48">
          <Bar :data="attemptsPerSubjectData" :options="chartOptions" />
        </div>
      </div>

      <div class="ptm-card">
        <h3 class="text-sm font-semibold text-ptm-gray mb-4">Daily Attempts (last 14 days)</h3>
        <div class="h-48">
          <Line :data="dailyAttemptsData" :options="chartOptions" />
        </div>
      </div>

      <div class="ptm-card">
        <h3 class="text-sm font-semibold text-ptm-gray mb-4">Score Distribution</h3>
        <div class="h-48 flex items-center justify-center">
          <Doughnut :data="scoreDistData" :options="{ ...chartOptions, plugins: { legend: { display: true, position: 'right' } } }" />
        </div>
      </div>

      <div class="ptm-card">
        <h3 class="text-sm font-semibold text-ptm-gray mb-4">Average Score per Test</h3>
        <div class="h-48">
          <Bar :data="avgScoreData" :options="chartOptions" />
        </div>
      </div>
    </div>

    <!-- Recent attempts -->
    <div class="ptm-card">
      <h3 class="text-base font-bold text-ptm-navy mb-4">Recent Attempts</h3>
      <div class="overflow-x-auto">
        <table class="ptm-table">
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
              <td>{{ row.test_name }}</td>
              <td>{{ row.student_name || 'Guest' }}</td>
              <td>{{ formatDate(row.started_at) }}</td>
              <td>{{ row.total_score ?? '—' }} / {{ row.max_score ?? '—' }}</td>
              <td>
                <span :class="row.status === 'completed' ? 'ptm-badge-active' : 'ptm-badge-inactive'">
                  {{ row.status }}
                </span>
              </td>
            </tr>
            <tr v-if="!charts.recent_attempts?.length">
              <td colspan="5" class="text-center text-ptm-gray py-6">No attempts yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
