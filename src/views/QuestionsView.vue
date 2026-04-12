<script setup>
  // admin/js/admin-app/src/views/QuestionsView.vue
  import { ref, onMounted, computed } from "vue";
  import { useAdminStore } from "@/stores/adminStore";
  import { useToast } from "@/composables/useToast";

  const store = useAdminStore();
  const toast = useToast();
  const showForm = ref(false);
  const editingId = ref(null);
  const deleteId = ref(null);
  const step = ref(1);
  const subjectFilter = ref("");
  const testFilter = ref("");

  const QUESTION_TYPES = [
    { value: "mcq_single", label: "MCQ Single Choice" },
    { value: "mcq_multiple", label: "MCQ Multiple Choice" },
    { value: "inline_dropdown", label: "Inline Dropdown (Cloze)" },
    { value: "sentence_matching", label: "Sentence Matching" },
    { value: "multi_row_dropdown", label: "Multi-Row Dropdown" },
    { value: "writing", label: "Writing" },
  ];

  function blankForm() {
    return {
      test_id: "",
      question_type: "mcq_single",
      question_order: 1,
      marks: 1,
      stimulus_content: "",
      stimulus_tabs: [],
      question_content: "",
      question_data: {
        options: [
          { id: "a", text: "" },
          { id: "b", text: "" },
        ],
      },
      correct_answer: null,
      stimulusType: "none",
      status: "published",
    };
  }

  const form = ref(blankForm());
  const formErrors = ref({});

  const filteredTests = computed(() =>
    subjectFilter.value
      ? store.tests.filter(
          (t) => String(t.subject_id) === String(subjectFilter.value),
        )
      : store.tests,
  );

  onMounted(async () => {
    await Promise.all([store.fetchSubjects(), store.fetchTests()]);
    await store.fetchQuestions();
  });

  async function applyFilter() {
    await store.fetchQuestions(testFilter.value || null);
  }

  function openCreate() {
    editingId.value = null;
    form.value = blankForm();
    formErrors.value = {};
    step.value = 1;
    showForm.value = true;
  }

  function openEdit(q) {
    editingId.value = q.id;
    form.value = {
      ...q,
      stimulusType: q.stimulus_tabs?.length
        ? "tabs"
        : q.stimulus_content
          ? "single"
          : "none",
      question_data: q.question_data || {},
      status: q.status || "published",
    };
    formErrors.value = {};
    step.value = 1;
    showForm.value = true;
  }

  // ── Step 2: add option helpers ─────────────────────────────────────────────
  function addMcqOption() {
    const opts = form.value.question_data.options || [];
    const nextId = String.fromCharCode(97 + opts.length);
    opts.push({ id: nextId, text: "" });
  }

  function removeMcqOption(idx) {
    form.value.question_data.options.splice(idx, 1);
  }

  function addStimulusTab() {
    form.value.stimulus_tabs.push({
      label: `Extract ${String.fromCharCode(65 + form.value.stimulus_tabs.length)}`,
      content: "",
    });
  }

  function removeStimulusTab(i) {
    form.value.stimulus_tabs.splice(i, 1);
  }

  // Inline dropdown gap management.
  function insertGap() {
    const gapId = `GAP_${(form.value.question_data.gaps?.length || 0) + 1}`;
    form.value.question_data.text_with_gaps =
      (form.value.question_data.text_with_gaps || "") + ` [${gapId}]`;
    if (!form.value.question_data.gaps) form.value.question_data.gaps = [];
    form.value.question_data.gaps.push({ id: gapId, options: [] });
  }

  function addGapOption(gapIdx) {
    form.value.question_data.gaps[gapIdx].options.push("");
  }

  // Sentence matching.
  function addSentence() {
    if (!form.value.question_data.sentences_pool)
      form.value.question_data.sentences_pool = [];
    const id = `s${form.value.question_data.sentences_pool.length + 1}`;
    form.value.question_data.sentences_pool.push({ id, text: "" });
  }

  // Multi row dropdown.
  function addSubQuestion() {
    if (!form.value.question_data.sub_questions)
      form.value.question_data.sub_questions = [];
    const id = `sq${form.value.question_data.sub_questions.length + 1}`;
    form.value.question_data.sub_questions.push({
      id,
      text: "",
      options: ["A", "B", "C", "D"],
    });
  }
  async function confirmDuplicate(id) {
    try {
      await store.duplicateQuestion(id);
      toast.success("Question duplicated as draft.");
    } catch (err) {
      toast.error(err.message);
    }
  }
  async function saveForm() {
    formErrors.value = {};
    if (!form.value.test_id) {
      formErrors.value.test_id = "Test is required.";
      return;
    }
    if (!form.value.question_type) {
      formErrors.value.question_type = "Type is required.";
      return;
    }

    const payload = {
      test_id: form.value.test_id,
      question_type: form.value.question_type,
      question_order: form.value.question_order,
      marks: form.value.marks,
      status: form.value.status,
      stimulus_content:
        form.value.stimulusType === "single" ? form.value.stimulus_content : "",
      stimulus_tabs:
        form.value.stimulusType === "tabs" ? form.value.stimulus_tabs : null,
      question_content: form.value.question_content,
      question_data: form.value.question_data,
      correct_answer: form.value.correct_answer,
    };

    try {
      if (editingId.value) {
        await store.updateQuestion(editingId.value, payload);
        toast.success("Question updated.");
      } else {
        await store.createQuestion(payload);
        toast.success("Question created.");
      }
      showForm.value = false;
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function confirmDelete() {
    try {
      await store.deleteQuestion(deleteId.value);
      toast.success("Question deleted.");
      deleteId.value = null;
    } catch (err) {
      toast.error(err.message);
    }
  }

  const typeBadgeColors = {
    mcq_single: "bg-blue-100 text-blue-700",
    mcq_multiple: "bg-indigo-100 text-indigo-700",
    inline_dropdown: "bg-purple-100 text-purple-700",
    sentence_matching: "bg-yellow-100 text-yellow-700",
    multi_row_dropdown: "bg-orange-100 text-orange-700",
    writing: "bg-teal-100 text-teal-700",
  };
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3 flex-wrap">
        <h2 class="text-base font-bold text-ptm-navy">Questions</h2>
        <select
          v-model="subjectFilter"
          @change="testFilter = ''"
          class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">All Subjects</option>
          <option v-for="s in store.subjects" :key="s.id" :value="s.id">
            {{ s.title }}
          </option>
        </select>
        <select
          v-model="testFilter"
          @change="applyFilter"
          class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">All Tests</option>
          <option v-for="t in filteredTests" :key="t.id" :value="t.id">
            {{ t.title }}
          </option>
        </select>
      </div>
      <button
        @click="openCreate"
        class="bg-ptm-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-ptm-navy-light transition"
      >
        + Add New Question
      </button>
    </div>

    <div class="ptm-card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="ptm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Test</th>
              <th>Type</th>
              <th>Status</th>
              <th>Marks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.loading">
              <td colspan="6" class="text-center py-10">
                <div
                  class="inline-block w-6 h-6 border-2 border-ptm-navy border-t-transparent rounded-full animate-spin"
                ></div>
              </td>
            </tr>
            <tr v-for="q in store.questions" :key="q.id">
              <td>{{ q.question_order }}</td>
              <td class="text-xs text-ptm-gray">
                {{ q.subject_title }} › {{ q.test_title }}
              </td>
              <td>
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                    typeBadgeColors[q.question_type] ||
                      'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ q.question_type.replace(/_/g, " ") }}
                </span>
              </td>
              <td>
                <span
                  :class="
                    q.status === 'draft' ? 'text-yellow-600' : 'text-green-600'
                  "
                  class="text-xs font-semibold"
                >
                  {{ q.status }}
                </span>
              </td>
              <td>{{ q.marks }}</td>
              <td>
                <div class="flex gap-2">
                  <button
                    @click="openEdit(q)"
                    class="text-ptm-navy hover:underline text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDuplicate(q.id)"
                    class="text-ptm-gray hover:underline text-xs font-medium"
                  >
                    Copy
                  </button>
                  <button
                    @click="deleteId = q.id"
                    class="text-ptm-red hover:underline text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!store.loading && !store.questions.length">
              <td colspan="6" class="text-center py-10 text-ptm-gray">
                No questions yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 3-Step Form Modal -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 max-h-[92vh] overflow-y-auto"
        >
          <!-- Step indicators -->
          <div class="flex items-center gap-3 mb-6">
            <div
              v-for="i in 3"
              :key="i"
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition',
                step === i
                  ? 'bg-ptm-navy text-white'
                  : step > i
                    ? 'bg-ptm-green text-white'
                    : 'bg-gray-200 text-gray-500',
              ]"
            >
              {{ step > i ? "✓" : i }}
            </div>
            <span class="text-sm text-ptm-gray ml-2">
              {{
                step === 1
                  ? "Basic Info"
                  : step === 2
                    ? "Stimulus (Left Panel)"
                    : "Question & Answer (Right Panel)"
              }}
            </span>
          </div>

          <!-- STEP 1: Basic info -->
          <div v-if="step === 1" class="space-y-4">
            <h3 class="text-lg font-bold text-ptm-navy mb-2">
              Step 1 — Basic Info
            </h3>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Subject (for filtering)</label
              >
              <select
                v-model="subjectFilter"
                @change="testFilter = ''"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Subjects</option>
                <option v-for="s in store.subjects" :key="s.id" :value="s.id">
                  {{ s.title }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Test *</label
              >
              <select
                v-model="form.test_id"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select test…</option>
                <option v-for="t in filteredTests" :key="t.id" :value="t.id">
                  {{ t.title }}
                </option>
              </select>
              <p v-if="formErrors.test_id" class="text-ptm-red text-xs mt-1">
                {{ formErrors.test_id }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Question Type *</label
              >
              <select
                v-model="form.question_type"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option
                  v-for="t in QUESTION_TYPES"
                  :key="t.value"
                  :value="t.value"
                >
                  {{ t.label }}
                </option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Question Order</label
                >
                <input
                  v-model.number="form.question_order"
                  type="number"
                  min="1"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Marks</label
                >
                <input
                  v-model.number="form.marks"
                  type="number"
                  min="0"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <!-- status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Status</label
              >
              <select
                v-model="form.status"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <!-- STEP 2: Stimulus -->
          <div v-if="step === 2" class="space-y-4">
            <h3 class="text-lg font-bold text-ptm-navy mb-2">
              Step 2 — Stimulus (Left Panel)
            </h3>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Stimulus type</label
              >
              <div class="flex gap-3">
                <label
                  v-for="opt in [
                    { value: 'none', label: 'None' },
                    { value: 'single', label: 'Single passage' },
                    { value: 'tabs', label: 'Multiple tabs (Extracts)' },
                  ]"
                  :key="opt.value"
                  class="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    v-model="form.stimulusType"
                    :value="opt.value"
                    class="accent-ptm-navy"
                  />
                  <span class="text-sm">{{ opt.label }}</span>
                </label>
              </div>
            </div>

            <div v-if="form.stimulusType === 'single'">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Passage HTML</label
              >
              <textarea
                v-model="form.stimulus_content"
                rows="8"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="<p>Passage content here…</p>"
              ></textarea>
            </div>

            <div v-if="form.stimulusType === 'tabs'" class="space-y-3">
              <div
                v-for="(tab, i) in form.stimulus_tabs"
                :key="i"
                class="border border-gray-200 rounded-xl p-4"
              >
                <div class="flex items-center justify-between mb-2">
                  <input
                    v-model="tab.label"
                    type="text"
                    placeholder="Extract A"
                    class="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                  />
                  <button
                    @click="removeStimulusTab(i)"
                    class="text-ptm-red text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  v-model="tab.content"
                  rows="5"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                ></textarea>
              </div>
              <button
                @click="addStimulusTab"
                class="text-ptm-navy text-sm hover:underline font-medium"
              >
                + Add Tab
              </button>
            </div>
          </div>

          <!-- STEP 3: Question & Answer -->
          <div v-if="step === 3" class="space-y-5">
            <h3 class="text-lg font-bold text-ptm-navy mb-2">
              Step 3 — Question & Answer
            </h3>

            <!-- Question content -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >Question Content (HTML)</label
              >
              <textarea
                v-model="form.question_content"
                rows="4"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="<p>Which of the following…</p>"
              ></textarea>
            </div>

            <!-- MCQ Single / Multiple -->
            <template
              v-if="['mcq_single', 'mcq_multiple'].includes(form.question_type)"
            >
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Options</label
                >
                <div
                  v-for="(opt, i) in form.question_data.options || []"
                  :key="i"
                  class="flex items-center gap-2 mb-2"
                >
                  <span class="w-6 text-ptm-gray text-sm font-mono">{{
                    opt.id
                  }}</span>
                  <input
                    v-model="opt.text"
                    type="text"
                    placeholder="Option text"
                    class="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                  />
                  <button
                    @click="removeMcqOption(i)"
                    class="text-ptm-red text-xs"
                  >
                    ✕
                  </button>
                </div>
                <button
                  @click="addMcqOption"
                  class="text-ptm-navy text-sm hover:underline"
                >
                  + Add option
                </button>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer{{
                    form.question_type === "mcq_multiple" ? "(s)" : ""
                  }}
                </label>
                <div
                  v-if="form.question_type === 'mcq_single'"
                  class="flex flex-wrap gap-2"
                >
                  <label
                    v-for="opt in form.question_data.options || []"
                    :key="opt.id"
                    class="flex items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      :value="opt.id"
                      v-model="form.correct_answer"
                      class="accent-ptm-navy"
                    />
                    <span class="text-sm">{{ opt.id }}</span>
                  </label>
                </div>
                <div v-else class="flex flex-wrap gap-3">
                  <label
                    v-for="opt in form.question_data.options || []"
                    :key="opt.id"
                    class="flex items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="opt.id"
                      v-model="form.correct_answer"
                      class="accent-ptm-navy"
                    />
                    <span class="text-sm">{{ opt.id }}</span>
                  </label>
                </div>
              </div>
            </template>

            <!-- Inline Dropdown -->
            <template v-if="form.question_type === 'inline_dropdown'">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Text with gaps</label
                >
                <textarea
                  v-model="form.question_data.text_with_gaps"
                  rows="4"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                ></textarea>
                <button
                  @click="insertGap"
                  class="mt-1 text-ptm-navy text-sm hover:underline"
                >
                  + Insert [GAP]
                </button>
              </div>
              <div
                v-for="(gap, gi) in form.question_data.gaps || []"
                :key="gap.id"
                class="border border-gray-200 rounded-xl p-4"
              >
                <p class="font-semibold text-sm mb-2">{{ gap.id }} options</p>
                <div
                  v-for="(opt, oi) in gap.options"
                  :key="oi"
                  class="flex items-center gap-2 mb-1"
                >
                  <input
                    v-model="gap.options[oi]"
                    type="text"
                    class="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  />
                </div>
                <button
                  @click="addGapOption(gi)"
                  class="text-ptm-navy text-xs hover:underline"
                >
                  + Add option
                </button>
                <div class="mt-2">
                  <label class="text-xs text-ptm-gray">Correct: </label>
                  <select
                    v-model="form.correct_answer[gap.id]"
                    class="border border-gray-300 rounded px-2 py-0.5 text-sm ml-1"
                  >
                    <option v-for="o in gap.options" :key="o" :value="o">
                      {{ o }}
                    </option>
                  </select>
                </div>
              </div>
            </template>

            <!-- Sentence Matching -->
            <template v-if="form.question_type === 'sentence_matching'">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Sentence pool</label
                >
                <div
                  v-for="(s, i) in form.question_data.sentences_pool || []"
                  :key="s.id"
                  class="flex items-center gap-2 mb-1"
                >
                  <span class="text-xs text-ptm-gray w-8">{{ s.id }}</span>
                  <input
                    v-model="s.text"
                    type="text"
                    class="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  />
                </div>
                <button
                  @click="addSentence"
                  class="text-ptm-navy text-sm hover:underline"
                >
                  + Add sentence
                </button>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Gaps (letters, comma separated)</label
                >
                <input
                  :value="(form.question_data.gaps || []).join(', ')"
                  @input="
                    form.question_data.gaps = $event.target.value
                      .split(',')
                      .map((g) => g.trim())
                      .filter(Boolean)
                  "
                  type="text"
                  placeholder="A, B, C, D, E"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >Correct mapping (Gap → Sentence ID)</label
                >
                <div
                  v-for="gap in form.question_data.gaps || []"
                  :key="gap"
                  class="flex items-center gap-3 mb-2"
                >
                  <span class="font-bold text-ptm-navy w-8">{{ gap }}</span>
                  <select
                    v-model="form.correct_answer[gap]"
                    class="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  >
                    <option value="">— select —</option>
                    <option
                      v-for="s in form.question_data.sentences_pool || []"
                      :key="s.id"
                      :value="s.id"
                    >
                      {{ s.id }}: {{ s.text.slice(0, 30) }}…
                    </option>
                  </select>
                </div>
              </div>
            </template>

            <!-- Multi Row Dropdown -->
            <template v-if="form.question_type === 'multi_row_dropdown'">
              <div
                v-for="(sq, i) in form.question_data.sub_questions || []"
                :key="sq.id"
                class="border border-gray-200 rounded-xl p-4"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs text-ptm-gray">{{ sq.id }}</span>
                  <input
                    v-model="sq.text"
                    type="text"
                    placeholder="Sub-question text"
                    class="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-xs text-ptm-gray">Options (comma):</label>
                  <input
                    :value="(sq.options || []).join(',')"
                    @input="
                      sq.options = $event.target.value
                        .split(',')
                        .map((o) => o.trim())
                        .filter(Boolean)
                    "
                    class="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                    placeholder="A,B,C,D"
                  />
                  <label class="text-xs text-ptm-gray ml-2">Correct:</label>
                  <select
                    v-model="form.correct_answer[sq.id]"
                    class="border border-gray-300 rounded px-2 py-0.5 text-sm"
                  >
                    <option v-for="o in sq.options || []" :key="o" :value="o">
                      {{ o }}
                    </option>
                  </select>
                </div>
              </div>
              <button
                @click="addSubQuestion"
                class="text-ptm-navy text-sm hover:underline"
              >
                + Add sub-question
              </button>
            </template>

            <!-- Writing -->
            <template v-if="form.question_type === 'writing'">
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Prompt title</label
                  >
                  <input
                    v-model="form.question_data.prompt_title"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Context paragraph</label
                  >
                  <textarea
                    v-model="form.question_data.context"
                    rows="3"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Task instruction (bold)</label
                  >
                  <input
                    v-model="form.question_data.task_instruction"
                    type="text"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </template>
          </div>

          <!-- Navigation buttons -->
          <div class="flex justify-between mt-8">
            <button
              @click="step > 1 ? step-- : (showForm = false)"
              class="px-4 py-2 rounded-lg border border-gray-300 text-sm text-ptm-gray hover:bg-gray-100"
            >
              {{ step > 1 ? "← Back" : "Cancel" }}
            </button>
            <button
              v-if="step < 3"
              @click="step++"
              class="px-5 py-2 rounded-lg bg-ptm-navy text-white text-sm font-semibold hover:bg-ptm-navy-light"
            >
              Next →
            </button>
            <button
              v-else
              @click="saveForm"
              :disabled="store.loading"
              class="px-5 py-2 rounded-lg bg-ptm-green text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              {{ store.loading ? "Saving…" : "Save Question" }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="deleteId"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
        >
          <p class="text-lg font-semibold text-gray-800 mb-2">
            Delete Question?
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
