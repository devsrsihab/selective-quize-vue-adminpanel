<script setup>
// admin/js/admin-app/src/views/TestsView.vue
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { useToast } from '@/composables/useToast'

const store    = useAdminStore()
const toast    = useToast()
const showForm = ref(false)
const editingId = ref(null)
const deleteId  = ref(null)
const subjectFilter = ref('')

const form = ref({
  subject_id: '', title: '', instructions: '',
  time_limit_minutes: 30, sort_order: 0, status: 'active',
})
const formErrors = ref({})

onMounted(async () => {
  await Promise.all([store.fetchSubjects(), store.fetchTests()])
})

async function applyFilter() {
  await store.fetchTests(subjectFilter.value || null)
}

function openCreate() {
  editingId.value  = null
  form.value       = { subject_id: '', title: '', instructions: '', time_limit_minutes: 30, sort_order: 0, status: 'active' }
  formErrors.value = {}
  showForm.value   = true
}

function openEdit(test) {
  editingId.value  = test.id
  form.value       = { ...test }
  formErrors.value = {}
  showForm.value   = true
}

async function saveForm() {
  formErrors.value = {}
  if (!form.value.title.trim()) { formErrors.value.title = 'Title is required.'; return }
  if (!form.value.subject_id)   { formErrors.value.subject_id = 'Subject is required.'; return }

  try {
    if (editingId.value) {
      await store.updateTest(editingId.value, form.value)
      toast.success('Test updated.')
    } else {
      await store.createTest(form.value)
      toast.success('Test created.')
    }
    showForm.value = false
  } catch (err) {
    toast.error(err.message)
  }
}

async function confirmDelete() {
  try {
    await store.deleteTest(deleteId.value)
    toast.success('Test deleted.')
    deleteId.value = null
  } catch (err) {
    toast.error(err.message)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <h2 class="text-base font-bold text-ptm-navy">Tests</h2>
        <select
          v-model="subjectFilter"
          @change="applyFilter"
          class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">All Subjects</option>
          <option v-for="s in store.subjects" :key="s.id" :value="s.id">{{ s.title }}</option>
        </select>
      </div>
      <button @click="openCreate" class="bg-ptm-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ptm-navy-light transition">
        + Add New Test
      </button>
    </div>

    <div class="ptm-card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="ptm-table">
          <thead>
            <tr>
              <th>ID</th><th>Title</th><th>Subject</th><th>Questions</th><th>Time (min)</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.loading">
              <td colspan="7" class="text-center py-10">
                <div class="inline-block w-6 h-6 border-2 border-ptm-navy border-t-transparent rounded-full animate-spin"></div>
              </td>
            </tr>
            <tr v-for="test in store.tests" :key="test.id">
              <td class="text-ptm-gray">{{ test.id }}</td>
              <td class="font-medium">{{ test.title }}</td>
              <td class="text-ptm-gray text-xs">{{ test.subject_title }}</td>
              <td>{{ test.questions_count || 0 }}</td>
              <td>{{ test.time_limit_minutes }}</td>
              <td><span :class="test.status === 'active' ? 'ptm-badge-active' : 'ptm-badge-inactive'">{{ test.status }}</span></td>
              <td>
                <div class="flex gap-2">
                  <button @click="openEdit(test)" class="text-ptm-navy hover:underline text-xs font-medium">Edit</button>
                  <button @click="deleteId = test.id" class="text-ptm-red hover:underline text-xs font-medium">Delete</button>
                </div>
              </td>
            </tr>
            <tr v-if="!store.loading && !store.tests.length">
              <td colspan="7" class="text-center py-10 text-ptm-gray">No tests yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-bold text-ptm-navy mb-5">{{ editingId ? 'Edit Test' : 'Add New Test' }}</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select v-model="form.subject_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select subject…</option>
                <option v-for="s in store.subjects" :key="s.id" :value="s.id">{{ s.title }}</option>
              </select>
              <p v-if="formErrors.subject_id" class="text-ptm-red text-xs mt-1">{{ formErrors.subject_id }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input v-model="form.title" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <p v-if="formErrors.title" class="text-ptm-red text-xs mt-1">{{ formErrors.title }}</p>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Time Limit (min)</label>
                <input v-model.number="form.time_limit_minutes" type="number" min="1" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input v-model.number="form.sort_order" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select v-model="form.status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Instructions (HTML)</label>
              <textarea v-model="form.instructions" rows="6" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="<p>Read the following passage and answer questions…</p>"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button @click="showForm = false" class="px-4 py-2 rounded-lg border border-gray-300 text-sm text-ptm-gray hover:bg-gray-100">Cancel</button>
            <button @click="saveForm" :disabled="store.loading" class="px-5 py-2 rounded-lg bg-ptm-navy text-white text-sm font-semibold hover:bg-ptm-navy-light disabled:opacity-60">
              {{ store.loading ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="deleteId" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <p class="text-lg font-semibold text-gray-800 mb-2">Delete Test?</p>
          <p class="text-sm text-ptm-gray mb-6">This action cannot be undone.</p>
          <div class="flex justify-center gap-3">
            <button @click="deleteId = null" class="px-5 py-2 rounded-lg border border-gray-300 text-sm text-ptm-gray hover:bg-gray-100">Cancel</button>
            <button @click="confirmDelete" class="px-5 py-2 rounded-lg bg-ptm-red text-white text-sm font-semibold hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
