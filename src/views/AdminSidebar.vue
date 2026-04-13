<script setup>
  import { ref } from "vue";
  const props = defineProps({
    active: { type: String, required: true },
    testCount: { type: Number, default: 6 },
  });

  const emit = defineEmits(["navigate"]);

  const isOpen = ref(false);

  const navGroups = [
    {
      label: "Overview",
      items: [{ key: "dashboard", label: "Dashboard", icon: "dashboard" }],
    },
    {
      label: "Content",
      items: [
        { key: "subjects", label: "Subjects", icon: "menu_book" },
        { key: "tests", label: "Tests", icon: "assignment", badge: true },
        { key: "questions", label: "Questions", icon: "help_outline" },
      ],
    },
    {
      label: "Analytics",
      items: [
        { key: "results", label: "Results & Attempts", icon: "bar_chart" },
      ],
    },
    {
      label: "System",
      items: [{ key: "settings", label: "Settings", icon: "settings" }],
    },
  ];

  function navigate(key) {
    emit("navigate", key);
    isOpen.value = false; // auto-close on mobile after navigation
  }
</script>

<template>
  <!-- ① Hamburger — only visible on mobile via CSS -->
  <button
    class="admin-sidebar__toggle"
    @click="isOpen = !isOpen"
    :aria-label="isOpen ? 'Close menu' : 'Open menu'"
    :aria-expanded="isOpen"
  >
    <i class="material-icons">{{ isOpen ? "close" : "menu" }}</i>
  </button>

  <!-- ② Overlay — only rendered + visible on mobile -->
  <transition name="sidebar-overlay">
    <div
      v-if="isOpen"
      class="admin-sidebar-overlay"
      @click="isOpen = false"
      aria-hidden="true"
    />
  </transition>

  <!-- ③ Sidebar -->
  <aside
    class="admin-sidebar"
    :class="{ 'admin-sidebar--open': isOpen }"
    role="navigation"
    aria-label="Admin navigation"
  >
    <!-- Brand -->
    <div class="admin-sidebar__brand">
      <div class="admin-sidebar__brand-icon">
        <span>E</span>
      </div>
      <div class="admin-sidebar__brand-info">
        <span class="admin-sidebar__brand-name">EduAssess</span>
        <span class="admin-sidebar__brand-sub">Practice Test Manager</span>
      </div>
    </div>

    <!-- Nav groups -->
    <nav class="admin-sidebar__nav">
      <div
        v-for="group in navGroups"
        :key="group.label"
        class="admin-sidebar__group"
      >
        <span class="admin-sidebar__group-label">{{ group.label }}</span>

        <button
          v-for="item in group.items"
          :key="item.key"
          class="admin-sidebar__item"
          :class="{ 'admin-sidebar__item--active': active === item.key }"
          @click="navigate(item.key)"
          :aria-current="active === item.key ? 'page' : undefined"
        >
          <span class="admin-sidebar__item-icon">
            <i class="material-icons">{{ item.icon }}</i>
          </span>
          <span class="admin-sidebar__item-label">{{ item.label }}</span>
          <span
            v-if="item.badge && testCount > 0"
            class="admin-sidebar__item-badge"
            >{{ testCount }}</span
          >
        </button>
      </div>
    </nav>

    <!-- Footer -->
    <div class="admin-sidebar__footer">
      <span class="admin-sidebar__version">PTM v1.0.0</span>
    </div>
  </aside>
</template>

<style lang="scss" src="../styles/AdminSidebar.scss" />
