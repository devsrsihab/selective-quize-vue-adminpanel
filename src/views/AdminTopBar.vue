<script setup>
// admin/js/admin-app/src/views/AdminTopBar.vue
const props = defineProps({
  active: { type: String, required: true },
})

const titles = {
  dashboard: 'Dashboard',
  subjects:  'Subjects',
  tests:     'Tests',
  questions: 'Questions',
  results:   'Results & Attempts',
  settings:  'Settings',
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
    <h2 class="text-xl font-bold text-ptm-navy">{{ titles[active] || 'Practice Tests' }}</h2>
    <div class="text-sm text-gray-500">WordPress Admin</div>
  </header>
</template>
