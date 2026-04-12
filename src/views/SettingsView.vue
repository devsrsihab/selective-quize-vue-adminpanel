<script setup>
// admin/js/admin-app/src/views/SettingsView.vue
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { useToast } from '@/composables/useToast'

const store   = useAdminStore()
const toast   = useToast()
const form    = ref({
  plugin_title:        '',
  access_code_visible: '1',
  data_retention_days: '365',
  publisher_credit:    '',
  nav_instructions:    [],
})

onMounted(async () => {
  await store.fetchSettings()
  Object.assign(form.value, store.settings)
})

async function save() {
  try {
    await store.saveSettings(form.value)
    toast.success('Settings saved.')
  } catch (err) {
    toast.error(err.message)
  }
}

function addNavPage() {
  form.value.nav_instructions.push({
    page: form.value.nav_instructions.length + 1,
    content: '<p>Instructions for this page…</p>',
  })
}

function removeNavPage(i) {
  form.value.nav_instructions.splice(i, 1)
}
</script>

<template>
  <div class="max-w-2xl space-y-6">
    <div class="ptm-card space-y-5">
      <h3 class="text-base font-bold text-ptm-navy">General Settings</h3>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Plugin Title</label>
        <input v-model="form.plugin_title" type="text" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <p class="text-xs text-ptm-gray mt-1">Displayed as the heading on the student-facing test selector.</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Publisher Credit</label>
        <input v-model="form.publisher_credit" type="text" placeholder="Practice Test Manager" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Show Access Code</label>
          <select v-model="form.access_code_visible" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Retention (days)</label>
          <input v-model="form.data_retention_days" type="number" min="30" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
    </div>

    <!-- Nav instructions -->
    <div class="ptm-card space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-ptm-navy">Navigation Instructions Pages</h3>
        <button @click="addNavPage" class="text-ptm-navy text-sm hover:underline font-medium">+ Add page</button>
      </div>

      <div v-for="(page, i) in form.nav_instructions" :key="i" class="border border-gray-200 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-ptm-gray">Page {{ i + 1 }}</span>
          <button @click="removeNavPage(i)" class="text-ptm-red text-xs hover:underline">Remove</button>
        </div>
        <textarea v-model="page.content" rows="5" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="<p>HTML content for this page…</p>"></textarea>
      </div>
    </div>

    <!-- Shortcode reference -->
    <div class="ptm-card">
      <h3 class="text-base font-bold text-ptm-navy mb-3">Shortcode</h3>
      <p class="text-sm text-gray-700">Embed the practice test interface on any page or post with:</p>
      <code class="block mt-2 bg-ptm-bg rounded-lg px-4 py-3 text-ptm-navy font-mono text-sm">[practice_test]</code>
    </div>

    <div class="flex justify-end">
      <button
        @click="save"
        :disabled="store.loading"
        class="px-6 py-2 bg-ptm-navy text-white rounded-lg font-semibold text-sm hover:bg-ptm-navy-light transition disabled:opacity-60"
      >
        {{ store.loading ? 'Saving…' : 'Save Settings' }}
      </button>
    </div>
  </div>
</template>
