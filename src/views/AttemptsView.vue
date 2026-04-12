<script setup>
// admin/js/admin-app/src/views/AttemptsView.vue
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { useToast } from '@/composables/useToast'

const store       = useAdminStore()
const toast       = useToast()
const detail      = ref(null)
const detailLoading = ref(false)
const statusFilter  = ref('')
const dateFrom      = ref('')
const dateTo        = ref('')

onMounted(async () => {
  await store.fetchTests()
  await store.fetchAttempts()
})

async function applyFilter() {
  await store.fetchAttempts({
    status:    statusFilter.value,
    date_from: dateFrom.value,
    date_to:   dateTo.value,
  })
}

async function openDetail(attempt) {
  detailLoading.value = true
  detail.value = null
  try {
    detail.value = await store.fetchAttemptDetail(attempt.id)
  } catch (err) {
    toast.error(err.message)
  } finally {
    detailLoading.value = false
  }
}

async function saveWritingMark(attemptId, answer) {
  try {
    await store.updateWritingMark(attemptId, answer.question_id, answer._editMark)
    toast.success('Mark saved.')
    answer.marks_awarded = answer._editMark
  } catch (err) {
    toast.error(err.message)
  }
}

function formatDate(dt) {
  return dt ? new Date(dt).toLocaleString() : '—'
}

function formatSeconds(s) {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}m ${sec}s`
}
</script>

<template>
  <div class="space-y-4">
    <!-- Filters -->
    <div class="ptm-card flex flex-wrap gap-4 items-end py-4">
      <div>
        <label class="block text-xs text-ptm-gray mb-1">Status</label>
        <select v-model="statusFilter" @change="applyFilter" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">All</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>
      <div>
        <label class="block text-xs text-ptm-gray mb-1">From</label>
        <input v-model="dateFrom" type="date" @change="applyFilter" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
      </div>
      <div>
        <label class="block text-xs text-ptm-gray mb-1">To</label>
        <input v-model="dateTo" type="date" @change="applyFilter" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
      </div>
    </div>

    <!-- Table -->
    <div class="ptm-card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="ptm-table">
          <thead>
            <tr>
              <th>ID</th><th>Test</th><th>Student</th><th>Started</th>
              <th>Submitted</th><th>Time</th><th>Score</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.loading">
              <td colspan="9" class="text-center py-10">
                <div class="inline-block w-6 h-6 border-2 border-ptm-navy border-t-transparent rounded-full animate-spin"></div>
              </td>
            </tr>
            <tr v-for="attempt in store.attempts" :key="attempt.id">
              <td class="text-ptm-gray text-xs">{{ attempt.id }}</td>
              <td class="text-sm font-medium">{{ attempt.test_title }}</td>
              <td class="text-xs text-ptm-gray">{{ attempt.student_name || attempt.session_id }}</td>
              <td class="text-xs">{{ formatDate(attempt.started_at) }}</td>
              <td class="text-xs">{{ formatDate(attempt.submitted_at) }}</td>
              <td class="text-xs">{{ formatSeconds(attempt.time_taken_seconds) }}</td>
              <td class="text-sm">
                <span v-if="attempt.total_score !== null">
                  {{ attempt.total_score }} / {{ attempt.max_score }}
                  <span class="text-xs text-ptm-gray ml-1">({{ attempt.percentage }}%)</span>
                </span>
                <span v-else class="text-ptm-gray">—</span>
              </td>
              <td>
                <span :class="attempt.status === 'completed' ? 'ptm-badge-active' : 'ptm-badge-inactive'">
                  {{ attempt.status }}
                </span>
              </td>
              <td>
                <button @click="openDetail(attempt)" class="text-ptm-navy hover:underline text-xs font-medium">View</button>
              </td>
            </tr>
            <tr v-if="!store.loading && !store.attempts.length">
              <td colspan="9" class="text-center py-10 text-ptm-gray">No attempts found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="detail || detailLoading" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-ptm-navy">Attempt Detail</h3>
              <p v-if="detail" class="text-sm text-ptm-gray">{{ detail.attempt?.test_title }} — {{ detail.attempt?.student_name || detail.attempt?.session_id }}</p>
            </div>
            <button @click="detail = null; detailLoading = false" class="text-ptm-gray hover:text-gray-800 text-2xl">✕</button>
          </div>

          <!-- Loading -->
          <div v-if="detailLoading" class="flex-1 flex items-center justify-center">
            <div class="w-8 h-8 border-4 border-ptm-navy border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- Content -->
          <div v-else-if="detail" class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Attempt meta -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div><span class="text-ptm-gray">Started:</span> {{ formatDate(detail.attempt?.started_at) }}</div>
              <div><span class="text-ptm-gray">Submitted:</span> {{ formatDate(detail.attempt?.submitted_at) }}</div>
              <div><span class="text-ptm-gray">Score:</span> <strong>{{ detail.attempt?.total_score }} / {{ detail.attempt?.max_score }}</strong></div>
              <div><span class="text-ptm-gray">Percentage:</span> <strong>{{ detail.attempt?.percentage }}%</strong></div>
            </div>

            <!-- Per-question breakdown -->
            <div class="space-y-4">
              <div
                v-for="(answer, i) in detail.answers || []"
                :key="answer.question_id"
                class="border border-gray-200 rounded-xl p-5"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xs font-bold text-ptm-gray">Q{{ i + 1 }}</span>
                      <span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-ptm-gray capitalize">{{ answer.question_type?.replace(/_/g,' ') }}</span>
                    </div>
                    <div class="text-sm text-gray-800 ptm-prose mb-2" v-html="answer.question_content?.slice(0, 120)"></div>

                    <div class="text-xs mt-2 space-y-1">
                      <div><span class="text-ptm-gray font-semibold">Student answer: </span>
                        <span v-if="answer.question_type !== 'writing'">{{ JSON.stringify(answer.answer_data) }}</span>
                        <div v-else class="mt-1 text-gray-700 ptm-prose border border-gray-200 rounded p-2" v-html="answer.answer_data"></div>
                      </div>
                    </div>

                    <!-- Manual mark for writing -->
                    <div v-if="answer.question_type === 'writing'" class="mt-3 flex items-center gap-3">
                      <label class="text-xs text-ptm-gray font-semibold">Marks awarded:</label>
                      <input
                        v-model.number="answer._editMark"
                        :placeholder="String(answer.marks_awarded || 0)"
                        type="number" min="0" :max="answer.marks"
                        class="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                      <span class="text-xs text-ptm-gray">/ {{ answer.marks }}</span>
                      <button
                        @click="saveWritingMark(detail.attempt.id, answer)"
                        class="px-3 py-1 bg-ptm-teal text-white text-xs rounded-lg hover:bg-teal-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <!-- Result badge -->
                  <div class="flex flex-col items-center flex-shrink-0">
                    <span :class="[
                      'w-9 h-9 rounded-full flex items-center justify-center text-white font-bold',
                      answer.question_type === 'writing' ? 'bg-ptm-teal' :
                      answer.is_correct ? 'bg-ptm-green' : 'bg-ptm-red'
                    ]">
                      {{ answer.question_type === 'writing' ? '✓' : answer.is_correct ? '✓' : '✗' }}
                    </span>
                    <span class="text-xs text-ptm-gray mt-1">{{ answer.marks_awarded || 0 }}/{{ answer.marks }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
