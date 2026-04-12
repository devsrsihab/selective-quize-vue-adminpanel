<script setup>
  // admin/js/admin-app/src/views/AdminSidebar.vue
  const props = defineProps({
    active: { type: String, required: true },
  });

  const emit = defineEmits(["navigate"]);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "⊞" },
    { key: "subjects", label: "Subjects", icon: "📚" },
    { key: "tests", label: "Tests", icon: "📋" },
    { key: "questions", label: "Questions", icon: "❓" },
    { key: "results", label: "Results & Attempts", icon: "📊" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];
</script>

<template>
  <aside class="w-56 bg-ptm-navy text-white flex flex-col flex-shrink-0">
    <div class="p-5 border-b border-white/10">
      <h1 class="text-base font-bold leading-tight">Practice Test Manager</h1>
    </div>

    <nav class="flex-1 py-4">
      <button
        v-for="item in navItems"
        :key="item.key"
        @click="emit('navigate', item.key)"
        :class="[
          'w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition text-left',
          active === item.key
            ? 'bg-white/20 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white',
        ]"
      >
        <span class="text-lg">{{ item.icon }}</span>
        {{ item.label }}
      </button>
    </nav>

    <div class="p-4 border-t border-white/10 text-xs text-white/40">
      PTM v{{ "1.0.0" }}
    </div>
  </aside>
</template>
