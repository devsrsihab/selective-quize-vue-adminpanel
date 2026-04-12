<script setup>
  // admin/js/admin-app/src/views/SubjectsView.vue
  import { ref, onMounted } from "vue";
  import { useAdminStore } from "@/stores/adminStore";
  import { useToast } from "@/composables/useToast";

  const store = useAdminStore();
  const toast = useToast();

  const showForm = ref(false);
  const editingId = ref(null);
  const deleteId = ref(null);
  const form = ref({
    title: "",
    description: "",
    icon: "",
    sort_order: 0,
    status: "active",
  });
  const formErrors = ref({});

  onMounted(() => store.fetchSubjects());

  function openCreate() {
    editingId.value = null;
    form.value = {
      title: "",
      description: "",
      icon: "",
      sort_order: 0,
      status: "active",
    };
    formErrors.value = {};
    showForm.value = true;
  }

  function openEdit(subject) {
    editingId.value = subject.id;
    form.value = { ...subject };
    formErrors.value = {};
    showForm.value = true;
  }

  async function saveForm() {
    formErrors.value = {};
    if (!form.value.title.trim()) {
      formErrors.value.title = "Title is required.";
      return;
    }
    try {
      if (editingId.value) {
        await store.updateSubject(editingId.value, form.value);
        toast.success("Subject updated.");
      } else {
        await store.createSubject(form.value);
        toast.success("Subject created.");
      }
      showForm.value = false;
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function confirmDelete() {
    try {
      await store.deleteSubject(deleteId.value);
      toast.success("Subject deleted.");
      deleteId.value = null;
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggleStatus(subject) {
    const newStatus = subject.status === "active" ? "inactive" : "active";
    try {
      await store.updateSubject(subject.id, { status: newStatus });
      toast.success("Status updated.");
    } catch (err) {
      toast.error(err.message);
    }
  }
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-base font-bold text-ptm-navy">Subjects</h2>
      <button
        @click="openCreate"
        class="bg-ptm-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ptm-navy-light transition"
      >
        + Add New Subject
      </button>
    </div>

    <!-- Table -->
    <div class="ptm-card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="ptm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Tests</th>
              <th>Status</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.loading">
              <td colspan="7" class="text-center py-10">
                <div
                  class="inline-block w-6 h-6 border-2 border-ptm-navy border-t-transparent rounded-full animate-spin"
                ></div>
              </td>
            </tr>
            <tr v-for="subject in store.subjects" :key="subject.id">
              <td class="text-ptm-gray">{{ subject.id }}</td>
              <td class="font-medium">
                <span class="mr-2">{{ subject.icon }}</span
                >{{ subject.title }}
              </td>
              <td class="text-ptm-gray text-xs max-w-xs truncate">
                {{ subject.description }}
              </td>
              <td>{{ subject.tests_count || 0 }}</td>
              <td>
                <button
                  @click="toggleStatus(subject)"
                  :class="
                    subject.status === 'active'
                      ? 'ptm-badge-active'
                      : 'ptm-badge-inactive'
                  "
                >
                  {{ subject.status }}
                </button>
              </td>
              <td>{{ subject.sort_order }}</td>
              <td>
                <div class="flex gap-2">
                  <button
                    @click="openEdit(subject)"
                    class="text-ptm-navy hover:underline text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteId = subject.id"
                    class="text-ptm-red hover:underline text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!store.loading && !store.subjects.length">
              <td colspan="7" class="text-center py-10 text-ptm-gray">
                No subjects yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
          <h3 class="text-lg font-bold text-ptm-navy mb-5">
            {{ editingId ? "Edit Subject" : "Add New Subject" }}
          </h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Title *</label
              >
              <input
                v-model="form.title"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ptm-navy"
              />
              <p v-if="formErrors.title" class="text-ptm-red text-xs mt-1">
                {{ formErrors.title }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Description</label
              >
              <textarea
                v-model="form.description"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ptm-navy"
              ></textarea>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Icon</label
                >
                <input
                  v-model="form.icon"
                  type="text"
                  placeholder="📝"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ptm-navy"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Sort Order</label
                >
                <input
                  v-model.number="form.sort_order"
                  type="number"
                  min="0"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ptm-navy"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Status</label
                >
                <select
                  v-model="form.status"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ptm-navy"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showForm = false"
              class="px-4 py-2 rounded-lg border border-gray-300 text-sm text-ptm-gray hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              @click="saveForm"
              :disabled="store.loading"
              class="px-5 py-2 rounded-lg bg-ptm-navy text-white text-sm font-semibold hover:bg-ptm-navy-light transition disabled:opacity-60"
            >
              {{ store.loading ? "Saving…" : "Save" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete confirm -->
      <div
        v-if="deleteId"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
        >
          <p class="text-lg font-semibold text-gray-800 mb-2">
            Delete Subject?
          </p>
          <p class="text-sm text-ptm-gray mb-6">
            This action cannot be undone.
          </p>
          <div class="flex justify-center gap-3">
            <button
              @click="deleteId = null"
              class="px-5 py-2 rounded-lg border border-gray-300 text-sm text-ptm-gray hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              @click="confirmDelete"
              class="px-5 py-2 rounded-lg bg-ptm-red text-white text-sm font-semibold hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
