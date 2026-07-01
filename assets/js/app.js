/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global state container
const state = {
  currentScreen: "home", // "home", "question", "end"
  currentQuestionIndex: 0,
  hasSavedProgress: false,

  // User input & progress keyed by question ID
  // For connected requirements, they are keyed inside requirements sub-objects
  progress: {
    // Structure per question:
    // [questionId]: {
    //    theoryAnswer: string,
    //    photo1: string (base64),
    //    photo2: string (base64),
    //    note: string,
    //    shownModelAnswer: boolean,
    //    selectedScore: number (0-10),
    //    isConfirmed: boolean,
    //    hasCalculationError: boolean,
    //    requirements: {
    //       [reqId]: {
    //          theoryAnswer: string,
    //          photo1: string,
    //          photo2: string,
    //          note: string,
    //          shownModelAnswer: boolean,
    //          selectedScore: number,
    //          isConfirmed: boolean,
    //          hasCalculationError: boolean
    //       }
    //    }
    // }
  },

  // Active requirement ID per question with connected requirements
  activeRequirementId: {}
};

// IndexedDB and LocalStorage multiple-fallback configuration
const DB_NAME = "SchoolExamDB";
const STORE_NAME = "examState";

const memStorage = {};

function isLocalStorageAvailable() {
  try {
    const key = "__test_key__";
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

const useLocalStorage = isLocalStorageAvailable();

function openDB() {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = () => resolve(null);
    } catch (err) {
      console.warn("IndexedDB not accessible in this context:", err);
      resolve(null);
    }
  });
}

async function saveToDB(key, val) {
  try {
    const db = await openDB();
    if (db) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(val, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      return;
    }
  } catch (err) {
    console.warn("IndexedDB Save Failed, trying localStorage fallback:", err);
  }

  if (useLocalStorage) {
    try {
      localStorage.setItem(`${DB_NAME}_${key}`, JSON.stringify(val));
      return;
    } catch (err) {
      console.warn("LocalStorage Save Failed, trying Memory fallback:", err);
    }
  }

  memStorage[key] = JSON.parse(JSON.stringify(val));
}

async function getFromDB(key) {
  try {
    const db = await openDB();
    if (db) {
      const result = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      if (result !== undefined) return result;
    }
  } catch (err) {
    console.warn("IndexedDB Get Failed, trying localStorage fallback:", err);
  }

  if (useLocalStorage) {
    try {
      const val = localStorage.getItem(`${DB_NAME}_${key}`);
      if (val !== null) return JSON.parse(val);
    } catch (err) {
      console.warn("LocalStorage Get Failed, trying Memory fallback:", err);
    }
  }

  return memStorage[key] !== undefined ? memStorage[key] : null;
}

async function clearDB() {
  try {
    const db = await openDB();
    if (db) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  } catch (err) {
    console.warn("IndexedDB Clear Failed:", err);
  }

  if (useLocalStorage) {
    try {
      localStorage.removeItem(`${DB_NAME}_userProgress_chemistry-chapter-1-section-1-v1`);
      localStorage.removeItem(`${DB_NAME}_userMeta_chemistry-chapter-1-section-1-v1`);
    } catch (err) {
      console.warn("LocalStorage Clear Failed:", err);
    }
  }

  for (const k in memStorage) {
    delete memStorage[k];
  }
}

// Reliable global question completion checks
function isRequirementComplete(qId, reqId) {
  if (!window.examData || !window.examData.questions) return false;
  const q = window.examData.questions.find(item => String(item.id) === String(qId));
  if (!q) return false;
  const qProg = state.progress[qId];
  if (!qProg || !qProg.requirements || !qProg.requirements[reqId]) return false;
  const prog = qProg.requirements[reqId];

  // If already confirmed or status says "مقيّم", treat as complete.
  // This is a direct migration/old state fallback layer.
  if (prog.isConfirmed) {
    return true;
  }
  if (prog.selectedScore !== null && prog.selectedScore !== undefined) {
    const scoreNum = parseInt(prog.selectedScore);
    if (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 10 && prog.shownModelAnswer) {
      return true;
    }
  }

  // Determine requirement type: since it is nested, its type is the parent's type
  const isCalc = (q.type === "calculation");
  if (isCalc) {
    // CALCULATION REQUIREMENT IS COMPLETE ONLY WHEN:
    // - The required first solution image was uploaded.
    // - The model answer was opened.
    // - The student selected a score.
    // - The student clicked “تثبيت التقييم”.
    // - The evaluation is actually saved and marked as confirmed.
    return !!(prog.photo1 && String(prog.photo1).trim() !== "" && prog.shownModelAnswer && prog.selectedScore !== null && prog.isConfirmed);
  } else {
    // THEORY REQUIREMENT IS COMPLETE ONLY WHEN:
    // - The student entered an answer.
    // - The model answer was opened.
    // - The student selected a score.
    // - The student clicked “تثبيت التقييم”.
    // - The evaluation is actually saved and marked as confirmed.
    return !!(prog.theoryAnswer && String(prog.theoryAnswer).trim() !== "" && prog.shownModelAnswer && prog.selectedScore !== null && prog.isConfirmed);
  }
}

function isQuestionComplete(qId) {
  if (!window.examData || !window.examData.questions) return false;
  const q = window.examData.questions.find(item => String(item.id) === String(qId));
  if (!q) return false;
  const qProg = state.progress[qId];
  if (!qProg) return false;

  // CONNECTED / NESTED REQUIREMENTS:
  // - Every nested requirement must have its own confirmed evaluation.
  // - The parent question is complete only when all its nested requirements are complete.
  if (q.requirements && q.requirements.length > 0) {
    return q.requirements.every(req => isRequirementComplete(qId, req.id));
  }

  // If already confirmed or status says "مقيّم", treat as complete.
  // This is a direct migration/old state fallback layer.
  if (qProg.isConfirmed) {
    return true;
  }
  if (qProg.selectedScore !== null && qProg.selectedScore !== undefined) {
    const scoreNum = parseInt(qProg.selectedScore);
    if (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 10 && qProg.shownModelAnswer) {
      return true;
    }
  }

  // Single question
  const isCalc = (q.type === "calculation");
  if (isCalc) {
    return !!(qProg.photo1 && String(qProg.photo1).trim() !== "" && qProg.shownModelAnswer && qProg.selectedScore !== null && qProg.isConfirmed);
  } else {
    return !!(qProg.theoryAnswer && String(qProg.theoryAnswer).trim() !== "" && qProg.shownModelAnswer && qProg.selectedScore !== null && qProg.isConfirmed);
  }
}

function areAllQuestionsComplete() {
  if (!window.examData || !window.examData.questions) return false;
  return window.examData.questions.every(q => isQuestionComplete(q.id));
}

// Check and load saved state from IndexedDB
async function loadPersistedState() {
  const savedProgress = await getFromDB("userProgress_chemistry-chapter-1-section-1-v1");
  const savedMeta = await getFromDB("userMeta_chemistry-chapter-1-section-1-v1");

  if (savedProgress) {
    state.progress = savedProgress;
    state.hasSavedProgress = true;
  } else {
    state.progress = {};
    state.hasSavedProgress = false;
  }

  if (savedMeta) {
    state.currentScreen = savedMeta.currentScreen || "home";
    state.currentQuestionIndex = savedMeta.currentQuestionIndex || 0;
    state.activeRequirementId = savedMeta.activeRequirementId || {};
  } else {
    state.currentScreen = "home";
    state.currentQuestionIndex = 0;
    state.activeRequirementId = {};
  }

  // Initialize and normalize progress structures for each question
  if (window.examData && window.examData.questions) {
    window.examData.questions.forEach(q => {
      let qProg = state.progress[q.id];
      if (!qProg) {
        qProg = createEmptyQuestionProgress(q);
        state.progress[q.id] = qProg;
      }

      // Safe normalization/migration layer
      if (qProg.theoryAnswer === undefined) qProg.theoryAnswer = "";
      if (qProg.photo1 === undefined) qProg.photo1 = "";
      if (qProg.photo2 === undefined) qProg.photo2 = "";
      if (qProg.note === undefined) qProg.note = "";
      if (qProg.shownModelAnswer === undefined) qProg.shownModelAnswer = false;
      if (qProg.selectedScore === undefined) qProg.selectedScore = null;
      if (qProg.isConfirmed === undefined) qProg.isConfirmed = false;
      if (qProg.hasCalculationError === undefined) qProg.hasCalculationError = false;

      // Ensure proper booleans for any migrated string/number representations
      if (qProg.isConfirmed === "true" || qProg.isConfirmed === 1) qProg.isConfirmed = true;
      if (qProg.shownModelAnswer === "true" || qProg.shownModelAnswer === 1) qProg.shownModelAnswer = true;
      if (qProg.hasCalculationError === "true" || qProg.hasCalculationError === 1) qProg.hasCalculationError = true;

      // If an old saved evaluation clearly has a confirmed score or status "مقيّم", treat it as confirmed
      if (qProg.selectedScore !== null && qProg.selectedScore !== undefined) {
        const scoreNum = parseInt(qProg.selectedScore);
        if (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 10) {
          qProg.shownModelAnswer = true;
          qProg.isConfirmed = true;
        }
      }

      // Handle nested requirements
      if (q.requirements && q.requirements.length > 0) {
        if (!qProg.requirements) {
          qProg.requirements = {};
        }
        q.requirements.forEach(req => {
          let rProg = qProg.requirements[req.id];
          if (!rProg) {
            rProg = {
              theoryAnswer: "",
              photo1: "",
              photo2: "",
              note: "",
              shownModelAnswer: false,
              selectedScore: null,
              isConfirmed: false,
              hasCalculationError: false
            };
            qProg.requirements[req.id] = rProg;
          } else {
            if (rProg.theoryAnswer === undefined) rProg.theoryAnswer = "";
            if (rProg.photo1 === undefined) rProg.photo1 = "";
            if (rProg.photo2 === undefined) rProg.photo2 = "";
            if (rProg.note === undefined) rProg.note = "";
            if (rProg.shownModelAnswer === undefined) rProg.shownModelAnswer = false;
            if (rProg.selectedScore === undefined) rProg.selectedScore = null;
            if (rProg.isConfirmed === undefined) rProg.isConfirmed = false;
            if (rProg.hasCalculationError === undefined) rProg.hasCalculationError = false;

            if (rProg.isConfirmed === "true" || rProg.isConfirmed === 1) rProg.isConfirmed = true;
            if (rProg.shownModelAnswer === "true" || rProg.shownModelAnswer === 1) rProg.shownModelAnswer = true;
            if (rProg.hasCalculationError === "true" || rProg.hasCalculationError === 1) rProg.hasCalculationError = true;

            if (rProg.selectedScore !== null && rProg.selectedScore !== undefined) {
              const rScoreNum = parseInt(rProg.selectedScore);
              if (!isNaN(rScoreNum) && rScoreNum >= 0 && rScoreNum <= 10) {
                rProg.shownModelAnswer = true;
                rProg.isConfirmed = true;
              }
            }
          }
        });
      }

      // Make sure active requirements are set to the first one by default
      if (q.requirements && q.requirements.length > 0 && !state.activeRequirementId[q.id]) {
        state.activeRequirementId[q.id] = q.requirements[0].id;
      }
    });
  }
}

function createEmptyQuestionProgress(q) {
  const base = {
    theoryAnswer: "",
    photo1: "",
    photo2: "",
    note: "",
    shownModelAnswer: false,
    selectedScore: null,
    isConfirmed: false,
    hasCalculationError: false
  };

  if (q.requirements && q.requirements.length > 0) {
    base.requirements = {};
    q.requirements.forEach(req => {
      base.requirements[req.id] = {
        theoryAnswer: "",
        photo1: "",
        photo2: "",
        note: "",
        shownModelAnswer: false,
        selectedScore: null,
        isConfirmed: false,
        hasCalculationError: false
      };
    });
  }
  return base;
}

// Persist both current screens/indexes and progress state
async function persistCurrentState() {
  await saveToDB("userProgress_chemistry-chapter-1-section-1-v1", state.progress);
  await saveToDB("userMeta_chemistry-chapter-1-section-1-v1", {
    currentScreen: state.currentScreen,
    currentQuestionIndex: state.currentQuestionIndex,
    activeRequirementId: state.activeRequirementId
  });
}

// Initialize the App
document.addEventListener("DOMContentLoaded", async () => {
  // Load local mock data if questions.js is not initialized
  if (!window.examData) {
    console.error("Critical: examData from questions.js not loaded! Using safe fallback.");
    window.examData = {
      chapterName: "الفصل الثالث: الاتزان الأيوني",
      lessonName: "الدرس: الحموض والقواعد",
      sourceInfo: "كيمياء • الفصل الثالث",
      totalQuestions: 5,
      questions: [
        {
          id: 1,
          type: "theory",
          metadata: {
            year: "2023",
            term: "الدور الأول",
            category: "وزاري"
          },
          text: "عرّف حمض أرهينيوس واذكر مثالاً عليه موضحاً سلوكه الحمضي بمعادلة كيميائية مفسرة.",
          modelAnswer: {
            theoryText: "حمض أرهينيوس هو المادة التي تتفكك في المحلول المائي لتعطي أيون الهيدروجين المائي <span class='ltr-text font-mono'>H⁺</span>.<br>مثال على ذلك تفكك حمض الهيدروكلوريك (<span class='ltr-text font-mono'>HCl</span>) في الماء."
          }
        }
      ]
    };
  }

  await loadPersistedState();
  render();

  // Initialize and handle theme (Dark/Light mode)
  const initTheme = () => {
    const htmlEl = document.documentElement;
    const toggleBtn = document.getElementById("nav-dark-toggle");
    const toggleIcon = document.getElementById("theme-toggle-icon");
    const toggleText = document.getElementById("theme-toggle-text");
    const isDark = localStorage.getItem("theme-dark") === "true";

    function applyTheme(dark) {
      if (dark) {
        htmlEl.classList.add("dark");
        localStorage.setItem("theme-dark", "true");
        if (toggleText) toggleText.textContent = "الوضع المضيء";
        if (toggleIcon) {
          // Sun SVG
          toggleIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m0 13.5V21M6.75 6.75l1.59 1.59M15.66 15.66l1.59 1.59M3 12h2.25m13.5 0H21M6.75 17.25l1.59-1.59M15.66 8.25l1.59-1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />`;
        }
      } else {
        htmlEl.classList.remove("dark");
        localStorage.setItem("theme-dark", "false");
        if (toggleText) toggleText.textContent = "الوضع الليلي";
        if (toggleIcon) {
          // Moon SVG
          toggleIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />`;
        }
      }
    }

    applyTheme(isDark);

    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const currentlyDark = htmlEl.classList.contains("dark");
        applyTheme(!currentlyDark);
      });
    }
  };

  initTheme();

  // Attach home button navigation click handler
  document.getElementById("nav-home-btn").addEventListener("click", (e) => {
    e.preventDefault();
    if (state.currentScreen !== "home") {
      state.currentScreen = "home";
      persistCurrentState();
      render();
    }
  });
});

// Primary render router
function render() {
  const contentArea = document.getElementById("main-content-area");
  if (!contentArea) return;

  contentArea.innerHTML = "";

  if (state.currentScreen === "home") {
    renderHomeScreen(contentArea);
  } else if (state.currentScreen === "question") {
    renderQuestionScreen(contentArea);
  } else if (state.currentScreen === "end") {
    renderEndScreen(contentArea);
  }

  // Smooth top-page scroll on screen transition
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// SCREEN 1: HOME/START EXAM
// ==========================================
// Helper to detect if any progress has been made at all
function hasAnyAttemptProgress() {
  if (!state.progress) return false;
  return Object.values(state.progress).some(p => {
    if (!p) return false;
    if (p.theoryAnswer && p.theoryAnswer.trim() !== "") return true;
    if (p.photo1 && p.photo1.trim() !== "") return true;
    if (p.photo2 && p.photo2.trim() !== "") return true;
    if (p.isConfirmed) return true;
    if (p.shownModelAnswer) return true;
    if (p.requirements) {
      return Object.values(p.requirements).some(r => {
        if (!r) return false;
        if (r.theoryAnswer && r.theoryAnswer.trim() !== "") return true;
        if (r.photo1 && r.photo1.trim() !== "") return true;
        if (r.photo2 && r.photo2.trim() !== "") return true;
        if (r.isConfirmed) return true;
        if (r.shownModelAnswer) return true;
        return false;
      });
    }
    return false;
  });
}

// Global modal for confirmation of resetting attempt
function showResetConfirmationModal(onConfirm) {
  const existing = document.getElementById("custom-confirm-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "custom-confirm-modal";
  modal.className = "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn";
  modal.setAttribute("dir", "rtl");

  modal.innerHTML = `
    <div class="bg-white dark:bg-[#1c182a] rounded-3xl p-6 md:p-8 card-shadow border border-[#D9D3F0] dark:border-[#3d3454] max-w-md w-full flex flex-col gap-6 relative animate-scaleUp">
      <div class="absolute right-0 left-0 top-0 h-1.5 bg-red-500 rounded-t-3xl"></div>

      <div class="flex items-center gap-3 mt-2">
        <div class="w-10 h-10 bg-red-50 dark:bg-red-950/40 rounded-xl flex items-center justify-center text-red-500">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 class="text-xl font-extrabold text-[#1D2433] dark:text-white">إعادة الامتحان من الصفر</h2>
      </div>

      <p class="text-sm md:text-base text-[#687084] dark:text-[#b0a9c0] font-medium leading-relaxed">
        سيتم حذف جميع إجاباتك وصور الحل والتقييمات المحفوظة لهذه المحاولة. هل تريد المتابعة؟
      </p>

      <div class="flex flex-col sm:flex-row-reverse gap-3 mt-2">
        <button id="modal-confirm-reset" type="button" class="w-full sm:flex-1 py-3 px-5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm md:text-base rounded-xl transition-all-custom flex items-center justify-center gap-2 cursor-pointer border-0 shadow-sm">
          إعادة الامتحان من الصفر
        </button>
        <button id="modal-cancel-reset" type="button" class="w-full sm:flex-1 py-3 px-5 bg-gray-100 dark:bg-[#2d2342] hover:bg-gray-200 dark:hover:bg-[#3a2d54] text-gray-700 dark:text-[#d1c9e3] font-bold text-sm md:text-base rounded-xl transition-all-custom flex items-center justify-center gap-2 cursor-pointer border-0">
          إلغاء
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const btnCancel = modal.querySelector("#modal-cancel-reset");
  const btnConfirm = modal.querySelector("#modal-confirm-reset");

  const closeModal = () => {
    modal.classList.add("animate-fadeOut");
    setTimeout(() => {
      modal.remove();
    }, 200);
  };

  btnCancel.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });

  btnConfirm.addEventListener("click", async (e) => {
    e.preventDefault();
    closeModal();
    if (onConfirm) {
      await onConfirm();
    }
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// Reset exam attempt state completely
async function resetExamAttempt() {
  try {
    await clearDB();
  } catch (err) {
    console.warn("Storage clearing error:", err);
  }

  state.currentScreen = "question";
  state.currentQuestionIndex = 0;
  state.activeRequirementId = {};
  state.progress = {};

  if (window.examData && window.examData.questions) {
    window.examData.questions.forEach(q => {
      state.progress[q.id] = createEmptyQuestionProgress(q);
      if (q.requirements && q.requirements.length > 0) {
        state.activeRequirementId[q.id] = q.requirements[0].id;
      }
    });
  }

  try {
    await persistCurrentState();
  } catch (err) {
    console.warn("Saving reset state failed:", err);
  }

  render();
}

// ==========================================
// SCREEN 1: HOME/START EXAM
// ==========================================
function renderHomeScreen(container) {
  const data = window.examData;

  const completed = areAllQuestionsComplete();
  const hasProgress = hasAnyAttemptProgress();

  let attemptState = "NO_ATTEMPT"; // "NO_ATTEMPT", "UNFINISHED", "COMPLETED"
  if (completed) {
    attemptState = "COMPLETED";
  } else if (hasProgress) {
    attemptState = "UNFINISHED";
  }

  let actionButtonsHtml = "";

  if (attemptState === "NO_ATTEMPT") {
    actionButtonsHtml = `
      <button id="btn-start-exam" type="button" class="w-full sm:flex-1 py-4 px-6 bg-[#5B2596] hover:bg-[#3E176D] text-white font-extrabold text-base md:text-lg rounded-2xl transition-all-custom btn-scale flex items-center justify-center gap-2 shadow-md cursor-pointer border-0">
        <span>ابدأ الامتحان</span>
        <svg class="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </button>
    `;
  } else if (attemptState === "UNFINISHED") {
    actionButtonsHtml = `
      <button id="btn-resume-exam" type="button" class="w-full sm:flex-1 py-4 px-6 bg-[#5B2596] hover:bg-[#3E176D] text-white font-extrabold text-base md:text-lg rounded-2xl transition-all-custom btn-scale flex items-center justify-center gap-2 shadow-md cursor-pointer border-0">
        <span>استئناف الامتحان</span>
        <svg class="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      </button>
    `;
  } else if (attemptState === "COMPLETED") {
    actionButtonsHtml = `
      <div class="flex flex-col sm:flex-row gap-4 items-center w-full">
        <button id="btn-view-end-screen" type="button" class="w-full sm:flex-1 py-4 px-6 bg-[#5B2596] hover:bg-[#3E176D] text-white font-extrabold text-base md:text-lg rounded-2xl transition-all-custom btn-scale flex items-center justify-center gap-2 shadow-md cursor-pointer border-0">
          <span>عرض نهاية الامتحان</span>
          <svg class="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </button>

        <button id="btn-restart-from-zero" type="button" class="w-full sm:flex-1 py-4 px-6 border-2 border-red-500 hover:bg-red-50 text-red-500 font-extrabold text-base md:text-lg rounded-2xl transition-all-custom flex items-center justify-center gap-2 cursor-pointer bg-transparent">
          <svg class="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span>إعادة الامتحان من الصفر</span>
        </button>
      </div>
    `;
  }

  const cardHtml = `
    <div class="w-full max-w-2xl mx-auto py-4 animate-fadeIn">
      <!-- MAIN SINGLE CARD -->
      <div class="bg-white rounded-3xl p-6 md:p-10 card-shadow premium-border flex flex-col gap-8 relative overflow-hidden">
        
        <!-- Subtle Purple accent side column -->
        <div class="absolute right-0 top-0 bottom-0 w-2 bg-[#5B2596]"></div>

        <div class="pr-3 flex flex-col gap-2">
          <p class="text-xs md:text-sm font-bold text-[#687084] tracking-wide">${data.sourceInfo}</p>
          <h1 class="text-2xl md:text-4xl font-extrabold text-[#1D2433] leading-tight">${data.chapterName}</h1>
          <p class="text-lg md:text-xl font-bold text-[#7641B4]">${data.lessonName}</p>
          <p class="text-sm md:text-base font-semibold text-[#687084] mt-2" dir="rtl">الأسئلة الوزارية حول (المقدمة - بعض المصطلحات الثرموداينمكية - الحرارة - المسائل الحسابية)</p>
        </div>

        <!-- Metric Section -->
        <div class="bg-[#E9E6FA] rounded-2xl p-5 flex items-center justify-between premium-border">
          <span class="text-sm md:text-base font-bold text-[#1D2433]">عدد الأسئلة الكلي للدرس:</span>
          <span class="text-lg md:text-xl font-extrabold text-[#5B2596]">${data.questions.length} أسئلة</span>
        </div>

        <!-- Collapsible instructions block -->
        <div class="border border-[#D9D3F0] rounded-2xl overflow-hidden bg-[#F5F3FF]">
          <button id="instructions-toggle-btn" class="w-full px-5 py-4 flex justify-between items-center bg-white font-bold text-sm md:text-base text-[#1D2433] hover:bg-[#F5F3FF] transition-all-custom focus:outline-none">
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5 text-[#5B2596]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              تعليمات الامتحان
            </span>
            <svg id="instructions-arrow" class="w-5 h-5 text-[#687084] transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          
          <div id="instructions-content" class="px-6 py-5 border-t border-[#D9D3F0] hidden bg-white">
            <ul class="flex flex-col gap-3 text-sm md:text-base text-[#687084] font-medium leading-relaxed" dir="rtl">
              <li class="flex items-start gap-2.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#5B2596] mt-2.5 shrink-0"></span>
                <span>أجب عن كل سؤال أولاً قبل أن يظهر لك الجواب النموذجي من المصدر.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#5B2596] mt-2.5 shrink-0"></span>
                <span>في المسائل الحسابية، اكتب حلك على ورقة خارجية ثم ارفع صورة الحل الأولى، وهي مطلوبة. يمكنك إضافة صورة ثانية اختيارية.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#5B2596] mt-2.5 shrink-0"></span>
                <span>بعد فتح الجواب النموذجي، قيّم إجابتك من 0 إلى 10 ثم اضغط «تثبيت التقييم».</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#5B2596] mt-2.5 shrink-0"></span>
                <span>في المسائل الحسابية فقط، خيار «يوجد خطأ حسابي في حلي المرفق» اختياري. عند اختياره يُخصم درجة واحدة فقط من تقييمك، ولا يقل التقييم النهائي عن 0.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#5B2596] mt-2.5 shrink-0"></span>
                <span>بعد تثبيت التقييم، تُقفل إجابتك وصور الحل والتقييم ولا يمكن تعديلها.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#5B2596] mt-2.5 shrink-0"></span>
                <span>لا يمكن الانتقال إلى نهاية الامتحان إلا بعد تثبيت تقييم جميع الأسئلة والمتطلبات الفرعية، إن وجدت.</span>
              </li>
              <li class="flex items-start gap-2.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#5B2596] mt-2.5 shrink-0"></span>
                <span>بعد الوصول إلى نهاية الامتحان، لا توجد مراجعة أو إعادة حل للأسئلة. الطريقة الوحيدة لبدء محاولة جديدة هي «إعادة الامتحان من الصفر».</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Start Actions -->
        <div class="flex flex-col sm:flex-row gap-4 items-center pt-2">
          ${actionButtonsHtml}
        </div>

      </div>
    </div>
  `;

  container.innerHTML = cardHtml;

  // Toggle instruction box trigger
  const toggleBtnBtn = document.getElementById("instructions-toggle-btn");
  const contentDiv = document.getElementById("instructions-content");
  const arrowSvg = document.getElementById("instructions-arrow");

  if (toggleBtnBtn && contentDiv && arrowSvg) {
    toggleBtnBtn.addEventListener("click", () => {
      contentDiv.classList.toggle("hidden");
      arrowSvg.classList.toggle("rotate-180");
    });
  }

  // Bind new events dynamically based on current state
  if (attemptState === "NO_ATTEMPT") {
    const btnStart = document.getElementById("btn-start-exam");
    if (btnStart) {
      btnStart.addEventListener("click", async (e) => {
        e.preventDefault();
        
        state.progress = {};
        state.activeRequirementId = {};
        state.currentQuestionIndex = 0;
        state.currentScreen = "question";

        window.examData.questions.forEach(q => {
          state.progress[q.id] = createEmptyQuestionProgress(q);
          if (q.requirements && q.requirements.length > 0) {
            state.activeRequirementId[q.id] = q.requirements[0].id;
          }
        });

        try {
          await persistCurrentState();
        } catch (err) {
          console.warn("Storage failed during start:", err);
        }
        render();
      });
    }
  } else if (attemptState === "UNFINISHED") {
    const btnResume = document.getElementById("btn-resume-exam");
    if (btnResume) {
      btnResume.addEventListener("click", async (e) => {
        e.preventDefault();
        
        let firstIncompleteIndex = window.examData.questions.findIndex(q => !isQuestionComplete(q.id));
        if (firstIncompleteIndex === -1) {
          firstIncompleteIndex = 0;
        }
        
        state.currentQuestionIndex = firstIncompleteIndex;
        state.currentScreen = "question";
        
        try {
          await persistCurrentState();
        } catch (err) {
          console.warn("Storage failed during resume:", err);
        }
        render();
      });
    }
  } else if (attemptState === "COMPLETED") {
    const btnViewEnd = document.getElementById("btn-view-end-screen");
    if (btnViewEnd) {
      btnViewEnd.addEventListener("click", async (e) => {
        e.preventDefault();
        state.currentScreen = "end";
        try {
          await persistCurrentState();
        } catch (err) {
          console.warn("Storage failed during view end:", err);
        }
        render();
      });
    }

    const btnRestart = document.getElementById("btn-restart-from-zero");
    if (btnRestart) {
      btnRestart.addEventListener("click", (e) => {
        e.preventDefault();
        showResetConfirmationModal(async () => {
          await resetExamAttempt();
        });
      });
    }
  }
}

// ==========================================
// SCREEN 2: QUESTION SCREEN
// ==========================================
function renderQuestionScreen(container) {
  const data = window.examData;
  const qIndex = state.currentQuestionIndex;
  const q = data.questions[qIndex];
  const qProg = state.progress[q.id];

  // Fix metadata generation so every field appears once with clean Arabic formatting
  const metaParts = [];
  if (q.metadata && q.metadata.page) {
    metaParts.push(`الصفحة: ${q.metadata.page}`);
  }
  if (q.metadata && q.metadata.year) {
    metaParts.push(`السنة: ${q.metadata.year}`);
  }
  if (q.metadata && q.metadata.term) {
    // Strip "الدور" prefix if it exists to avoid repetition
    const cleanTerm = q.metadata.term.replace(/^الدور\s+/, "").trim();
    metaParts.push(`الدور: ${cleanTerm}`);
  }
  const metadataHtml = metaParts.join(' <span class="mx-1.5 text-gray-300">|</span> ');

  // Helper to determine the consolidated state of a question
  const getQuestionStateLabel = (questionId) => {
    const question = data.questions.find(item => item.id === questionId);
    const progress = state.progress[questionId];

    if (question.requirements && question.requirements.length > 0) {
      // For compound questions, check requirements
      const totalReqs = question.requirements.length;
      const confirmedReqs = question.requirements.filter(r => progress.requirements[r.id].isConfirmed).length;
      
      if (confirmedReqs === totalReqs) {
        // All requirements evaluated, show overall status
        const scores = question.requirements.map(r => {
          const rProg = progress.requirements[r.id];
          const raw = rProg.selectedScore || 0;
          return rProg.hasCalculationError ? Math.max(0, raw - 1) : raw;
        });
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalReqs);
        return `مقيّم: ${avgScore}/10`;
      } else if (confirmedReqs > 0) {
        return `مقيّم جزئياً (${confirmedReqs}/${totalReqs})`;
      } else {
        const solvedSome = question.requirements.some(r => {
          const reqProg = progress.requirements[r.id];
          return reqProg.theoryAnswer !== "" || reqProg.photo1 !== "";
        });
        if (solvedSome) return "تم الحل";
        return "لم يبدأ";
      }
    } else {
      // Standard single question
      if (progress.isConfirmed) {
        const finalScore = progress.hasCalculationError ? Math.max(0, progress.selectedScore - 1) : progress.selectedScore;
        return `مقيّم: ${finalScore}/10`;
      } else if (progress.shownModelAnswer) {
        return "ظهر الحل";
      } else if (progress.theoryAnswer !== "" || progress.photo1 !== "") {
        return "تم الحل";
      }
      return "لم يبدأ";
    }
  };

  // Helper to get styling class for state labels in navigation
  const getStateClass = (questionId) => {
    const label = getQuestionStateLabel(questionId);
    if (label.startsWith("مقيّم")) {
      return "bg-[#5B2596] text-white border-[#5B2596]";
    } else if (label === "ظهر الحل") {
      return "bg-amber-100 text-amber-800 border-amber-300";
    } else if (label === "تم الحل") {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }
    return "bg-white text-[#687084] border-[#D9D3F0]";
  };

  const isAllEvaluated = areAllQuestionsComplete();

  // Top info and navigation bar
  let navBarHtml = `
    <!-- Top lesson context banner -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-6 bg-white p-4 rounded-2xl border border-[#D9D3F0] card-shadow">
      <div class="flex flex-col">
        <span class="text-xs font-bold text-[#687084]">${data.chapterName}</span>
        <span class="text-sm font-extrabold text-[#5B2596]">${data.lessonName}</span>
      </div>
      <div class="text-xs md:text-sm font-bold bg-[#E9E6FA] text-[#5B2596] px-3.5 py-1.5 rounded-full inline-block self-start">
        السؤال ${qIndex + 1} من ${data.questions.length}
      </div>
    </div>

    <!-- QUESTION NUMBERS NAVIGATION BAR (Desktop & Tablet) -->
    <div class="hidden md:flex justify-between items-center gap-3 bg-white p-4 rounded-2xl border border-[#D9D3F0] card-shadow mb-6">
      <span class="text-sm font-bold text-[#1D2433] shrink-0">فهرس الأسئلة:</span>
      <div class="flex gap-2 flex-wrap items-center">
        ${data.questions.map((item, idx) => {
          const isActive = idx === qIndex;
          const stateStyleClass = getStateClass(item.id);
          const stateLabel = getQuestionStateLabel(item.id);
          return `
            <button onclick="navigateToQuestion(${idx})" class="px-3.5 py-2 rounded-xl text-sm font-extrabold border-2 transition-all-custom flex items-center gap-1.5 cursor-pointer hover:border-[#5B2596] hover:bg-[#F5F3FF] ${isActive ? 'ring-2 ring-offset-2 ring-[#5B2596] scale-105' : ''} ${stateStyleClass}">
              <span class="bg-[#E9E6FA] text-[#5B2596] w-5 h-5 flex items-center justify-center rounded-lg text-xs font-black">${item.id}</span>
              <span class="text-[10px] opacity-90">${stateLabel}</span>
            </button>
          `;
        }).join("")}
      </div>
    </div>

    <!-- MOBILE NAVIGATION DROPDOWN BUTTON (Mobile-only) -->
    <div class="block md:hidden mb-6">
      <button id="mobile-nav-panel-toggle" class="w-full bg-white border border-[#D9D3F0] card-shadow px-4 py-3.5 rounded-xl flex justify-between items-center font-bold text-[#1D2433] active:bg-[#F5F3FF]">
        <span class="flex items-center gap-2">
          <svg class="w-5 h-5 text-[#5B2596]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          استعراض أسئلة الدرس (${qIndex + 1}/${data.questions.length})
        </span>
        <span class="text-xs bg-[#E9E6FA] text-[#5B2596] px-2.5 py-1 rounded-lg">${getQuestionStateLabel(q.id)}</span>
      </button>
    </div>
  `;

  // Start assembling the Question Card Markup
  let mainCardHtml = `
    <div class="bg-white rounded-3xl overflow-hidden card-shadow premium-border flex flex-col mb-8 animate-fadeIn">
      
      <!-- HEADER BANNER: Rounded design, Lavender border background -->
      <div class="bg-[#E9E6FA] border-b border-[#D9D3F0] px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-[#5B2596] text-white flex items-center justify-center rounded-xl font-black text-lg shadow-sm">
            ${q.id}
          </div>
          <div class="flex flex-col">
            <h3 class="text-sm font-bold text-[#3E176D]">السؤال الحالي</h3>
            <!-- Metadata line, omitting empty fields -->
            <div class="text-[11px] md:text-xs text-[#687084] font-medium flex items-center gap-1.5 flex-wrap" dir="rtl">
              ${metadataHtml}
            </div>
          </div>
        </div>
        <div class="text-xs font-extrabold ${q.type === 'calculation' ? 'bg-[#7641B4] text-white' : 'bg-white text-[#5B2596]'} border border-[#D9D3F0] px-3.5 py-1.5 rounded-full inline-block self-start sm:self-center">
          ${q.type === 'calculation' ? 'مسألة رياضية / حسابية' : 'سؤال نظري'}
        </div>
      </div>

      <!-- BODY: White with short purple vertical accent beside text -->
      <div class="p-6 md:p-8 flex flex-col gap-6">
        
        <!-- Text with Accent Bar -->
        <div class="border-r-4 border-[#5B2596] pr-4 py-1">
          <h2 class="text-lg md:text-xl font-extrabold text-[#1D2433] leading-relaxed">${renderMath(q.text)}</h2>
        </div>

        <!-- Optional scientific formula block -->
        ${q.scientificFormula ? `
          <div class="flex flex-col gap-1.5">
            <span class="text-xs font-bold text-[#687084]">الصيغة العلمية المعطاة:</span>
            <div class="equation-block">
              ${renderMath(q.scientificFormula)}
            </div>
          </div>
        ` : ""}

        <!-- INNER SECTIONS: Checks if question has nested connected requirements -->
        <div class="w-full">
          ${q.requirements && q.requirements.length > 0 
            ? renderRequirementsAccordion(q, qProg) 
            : renderStandardQuestionInput(q, qProg)
          }
        </div>

      </div>
    </div>

    <!-- PREV / NEXT BOTTOM NAVIGATION -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
      
      <!-- Previous Button -->
      <button onclick="navigatePrevious()" class="w-full sm:w-auto py-3.5 px-6 border border-[#D9D3F0] bg-white hover:bg-[#E9E6FA] text-[#687084] hover:text-[#5B2596] font-bold rounded-2xl transition-all-custom flex items-center justify-center gap-2 cursor-pointer active:scale-95">
        <svg class="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
        <span>السابق</span>
      </button>

      <!-- Next Button or End of Exam Button -->
      ${(qIndex === data.questions.length - 1) ? `
        <div class="flex flex-col items-center gap-2 w-full sm:w-auto">
          ${!isAllEvaluated ? `
            <span class="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">أكمل تقييم جميع الأسئلة أولاً</span>
          ` : ""}
          <button id="btn-finish-exam" ${!isAllEvaluated ? 'disabled' : ''} class="w-full sm:w-auto py-4 px-8 bg-[#5B2596] hover:bg-[#3E176D] text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:border-transparent disabled:cursor-not-allowed font-extrabold text-base md:text-lg rounded-2xl transition-all-custom flex items-center justify-center gap-2 cursor-pointer shadow-md ${!isAllEvaluated ? 'opacity-60' : 'btn-scale'}">
            <span>الانتقال إلى نهاية الامتحان</span>
            <svg class="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </button>
        </div>
      ` : `
        <button onclick="navigateNext()" class="w-full sm:w-auto py-3.5 px-6 bg-[#5B2596] hover:bg-[#3E176D] text-white font-bold rounded-2xl transition-all-custom flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md">
          <span>التالي</span>
          <svg class="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
      `}
    </div>

    <!-- MOBILE SLIDE OVER NAVIGATION MENU DRAWER -->
    <div id="question-panel-overlay" class="fixed inset-0 bg-black/50 z-[100] hidden flex justify-end">
      <div id="question-panel" class="w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col gap-6 transform translate-x-full overflow-y-auto">
        
        <div class="flex justify-between items-center border-b border-[#D9D3F0] pb-4">
          <span class="text-base font-extrabold text-[#5B2596]">قائمة أسئلة الدرس</span>
          <button id="mobile-nav-panel-close" class="p-2 rounded-lg bg-[#E9E6FA] text-[#5B2596] focus:outline-none">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col gap-3">
          ${data.questions.map((item, idx) => {
            const isActive = idx === qIndex;
            const stateStyleClass = getStateClass(item.id);
            const stateLabel = getQuestionStateLabel(item.id);
            return `
              <button onclick="navigateToQuestionMobile(${idx})" class="w-full p-3.5 rounded-xl border-2 font-bold text-sm flex justify-between items-center transition-all-custom ${isActive ? 'ring-2 ring-[#5B2596]' : ''} ${stateStyleClass}">
                <div class="flex items-center gap-2.5">
                  <span class="w-7 h-7 flex items-center justify-center rounded-lg bg-[#E9E6FA] text-[#5B2596] font-black">${item.id}</span>
                  <span class="text-right">السؤال ${item.id}</span>
                </div>
                <span class="text-xs opacity-90">${stateLabel}</span>
              </button>
            `;
          }).join("")}
        </div>

        <div class="mt-auto pt-6 border-t border-[#D9D3F0] flex flex-col gap-2">
          <span class="text-xs text-[#687084] font-medium text-center">إجمالي أسئلة الدرس: ${data.questions.length}</span>
          ${isAllEvaluated ? `
            <button id="btn-drawer-finish-exam" class="w-full py-3 bg-[#5B2596] text-white rounded-xl font-bold text-center">الانتقال للإنهاء</button>
          ` : `
            <p class="text-[10px] text-amber-700 font-bold bg-amber-50 p-2.5 rounded-lg text-center leading-normal">يجب تقييم كافة الأسئلة والمتطلبات الفرعية لتتمكن من الانتقال لإنهاء الدرس والامتحان.</p>
          `}
        </div>

      </div>
    </div>
  `;

  container.innerHTML = navBarHtml + mainCardHtml;

  // Add event triggers to newly created DOM
  setupScreenListeners(q, qProg);
}

// Sub-Renderer: Renders standard single question blocks
function renderStandardQuestionInput(q, qProg) {
  const isTheory = q.type === "theory";
  const isChoice = q.choices && q.choices.length > 0;

  return `
    <div class="flex flex-col gap-6">
      
      <!-- Theory Answer Box -->
      ${isTheory ? `
        <div class="flex flex-col gap-3">
          <div class="flex justify-between items-center">
            <label class="text-base font-extrabold text-[#1D2433]">${isChoice ? "اختر الجواب الصحيح من بين الأقواس:" : "إجابتك:"}</label>
            ${qProg.isConfirmed ? `<span class="text-xs bg-[#E9E6FA] text-[#5B2596] px-2.5 py-1 rounded-md font-bold">تم حفظ الإجابة وإغلاق التعديل</span>` : ""}
          </div>
          ${isChoice ? `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              ${q.choices.map(choice => {
                const isSelected = qProg.theoryAnswer === choice;
                const bgStyle = isSelected 
                  ? "bg-[#5B2596] text-white border-[#5B2596]" 
                  : "bg-white text-[#1D2433] border-2 border-[#D9D3F0] hover:bg-[#F5F3FF] hover:border-[#5B2596]";
                const disabledAttr = (qProg.isConfirmed || qProg.shownModelAnswer) ? "disabled" : "";
                return `
                  <button onclick="selectChoice('${q.id}', '${choice.replace(/'/g, "\\'")}')" ${disabledAttr}
                    class="p-4 rounded-2xl font-bold text-center text-sm md:text-base border-2 transition-all-custom cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${bgStyle}">
                    ${choice}
                  </button>
                `;
              }).join("")}
            </div>
          ` : `
            <textarea id="theory-answer-input" rows="4" placeholder="اكتب إجابتك هنا بالتفصيل..." 
              class="w-full p-4 rounded-2xl border-2 border-[#D9D3F0] focus:border-[#5B2596] focus:ring-1 focus:ring-[#5B2596] focus:outline-none font-medium text-sm md:text-base leading-relaxed bg-white text-[#1D2433] disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 transition-all-custom"
              ${qProg.isConfirmed || qProg.shownModelAnswer ? "disabled" : ""}>${qProg.theoryAnswer}</textarea>
          `}
        </div>
      ` : `
        <!-- Calculation Answer Block -->
        <div class="flex flex-col gap-6">
          <label class="text-base font-extrabold text-[#1D2433] mb-1">أرفق صور خطوات الحل من دفترك:</label>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Photo Slot 1 (Required) -->
            <div id="drop-zone-1" class="border-2 border-dashed border-[#D9D3F0] rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all-custom bg-[#F5F3FF]/40 relative min-h-[180px]">
              ${qProg.photo1 ? `
                <img src="${qProg.photo1}" class="max-h-[140px] w-auto object-contain rounded-xl shadow-sm mb-3">
                <div class="flex gap-2 z-10">
                  ${!(qProg.isConfirmed || qProg.shownModelAnswer) ? `
                    <button onclick="removePhoto('${q.id}', 1, null)" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">حذف</button>
                    <button onclick="triggerFileInput(1)" class="px-3 py-1.5 bg-white border border-[#D9D3F0] hover:bg-[#E9E6FA] text-[#5B2596] rounded-lg text-xs font-bold cursor-pointer">تغيير</button>
                  ` : `<span class="text-[10px] bg-gray-100 text-gray-500 py-1 px-2.5 rounded-md font-bold">تم القفل</span>`}
                </div>
              ` : `
                <!-- No Photo 1 -->
                <svg class="w-8 h-8 text-[#7641B4] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.115-.744.074-1.08-.136l-.006-.003a3.37 3.37 0 00-.41-.247M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 8.25H9m0 0V15m0-6.75l6.75 6.75" />
                </svg>
                <span class="text-xs md:text-sm font-bold text-[#1D2433]">صورة الحل 1 — مطلوبة</span>
                <span class="text-[10px] text-[#687084] mt-1">صور ورقة الحل بوضوح</span>
                ${!(qProg.isConfirmed || qProg.shownModelAnswer) ? `
                  <button onclick="triggerFileInput(1)" class="mt-3 px-4 py-2 bg-[#5B2596] hover:bg-[#3E176D] text-white font-bold text-xs rounded-xl cursor-pointer transition-all-custom">اختر صورة الحل</button>
                ` : ""}
              `}
              <input type="file" id="file-input-1" accept="image/*" class="hidden">
            </div>

            <!-- Photo Slot 2 (Optional) -->
            <div id="drop-zone-2" class="border-2 border-dashed border-[#D9D3F0] rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all-custom bg-[#F5F3FF]/40 relative min-h-[180px]">
              ${qProg.photo2 ? `
                <img src="${qProg.photo2}" class="max-h-[140px] w-auto object-contain rounded-xl shadow-sm mb-3">
                <div class="flex gap-2 z-10">
                  ${!(qProg.isConfirmed || qProg.shownModelAnswer) ? `
                    <button onclick="removePhoto('${q.id}', 2, null)" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">حذف</button>
                    <button onclick="triggerFileInput(2)" class="px-3 py-1.5 bg-white border border-[#D9D3F0] hover:bg-[#E9E6FA] text-[#5B2596] rounded-lg text-xs font-bold cursor-pointer">تغيير</button>
                  ` : `<span class="text-[10px] bg-gray-100 text-gray-500 py-1 px-2.5 rounded-md font-bold">تم القفل</span>`}
                </div>
              ` : `
                <!-- No Photo 2 -->
                <svg class="w-8 h-8 text-[#687084] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs md:text-sm font-bold text-[#1D2433]">صورة الحل 2 — اختيارية</span>
                <span class="text-[10px] text-[#687084] mt-1">أضف صورة ثانية إذا لزم الأمر</span>
                ${!(qProg.isConfirmed || qProg.shownModelAnswer) ? `
                  <button onclick="triggerFileInput(2)" class="mt-3 px-4 py-2 border-2 border-[#5B2596] hover:bg-[#E9E6FA] text-[#5B2596] font-bold text-xs rounded-xl cursor-pointer transition-all-custom">أضف صورة ثانية</button>
                ` : ""}
              `}
              <input type="file" id="file-input-2" accept="image/*" class="hidden">
            </div>

          </div>

          <!-- Note input block -->
          <div class="flex flex-col gap-2.5">
            <label class="text-sm font-bold text-[#687084]">ملاحظتك على الحل — اختيارية:</label>
            <textarea id="note-input" rows="2" placeholder="اكتب أي ملاحظات إضافية هنا..."
              class="w-full p-3 rounded-xl border-2 border-[#D9D3F0] focus:border-[#5B2596] focus:outline-none text-sm font-medium bg-white disabled:bg-gray-50 disabled:text-gray-500"
              ${qProg.isConfirmed || qProg.shownModelAnswer ? "disabled" : ""}>${qProg.note}</textarea>
          </div>

          <!-- Auto-save notification anchor -->
          <div id="autosave-indicator" class="flex items-center gap-1.5 text-xs text-emerald-600 font-bold opacity-0 transition-all duration-300 transform translate-y-1">
            <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>تم الحفظ تلقائياً</span>
          </div>

        </div>
      `}

      <!-- Model Answer Area (Revealed Accordion Style) -->
      ${(isTheory ? qProg.theoryAnswer !== "" : qProg.photo1 !== "") ? `
        <div class="border-2 border-[#D9D3F0] rounded-2xl overflow-hidden mt-2 bg-[#F5F3FF] shadow-sm">
          <button id="model-answer-toggle-btn" class="w-full px-5 py-4 flex justify-between items-center bg-white font-extrabold text-[#1D2433] hover:bg-[#F5F3FF] transition-all-custom">
            <span class="flex items-center gap-2 text-sm md:text-base">
              <svg class="w-5 h-5 text-[#5B2596]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              الجواب النموذجي من المصدر
            </span>
            <svg id="model-arrow" class="w-5 h-5 text-[#687084] transition-transform duration-300 ${qProg.shownModelAnswer ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          
          <div id="model-answer-content" class="p-5 md:p-6 border-t border-[#D9D3F0] bg-white ${qProg.shownModelAnswer ? '' : 'hidden'}">
            ${renderModelAnswerContent(q, isTheory)}
          </div>
        </div>
      ` : ""}

      <!-- Evaluation Section (Revealed once model answer opens) -->
      ${qProg.shownModelAnswer ? renderEvaluationGrid(q.id, qProg, false) : ""}

    </div>
  `;
}

// Sub-Renderer: Renders compound connected requirements inside accordion rows
function renderRequirementsAccordion(q, qProg) {
  const activeReqId = state.activeRequirementId[q.id];

  let accHtml = `<div class="flex flex-col gap-4 mt-2">`;

  q.requirements.forEach((req, idx) => {
    const isExpanded = req.id === activeReqId;
    const reqProg = qProg.requirements[req.id];
    const isTheory = q.type === "theory" || (!req.modelAnswer.law); // detect based on dynamic format

    // Determine badge state
    let badgeText = "بانتظار الإجابة";
    let badgeClass = "bg-gray-100 text-gray-500";
    if (reqProg.isConfirmed) {
      const finalScore = reqProg.hasCalculationError ? Math.max(0, reqProg.selectedScore - 1) : reqProg.selectedScore;
      badgeText = `مقيّم: ${finalScore}/10`;
      badgeClass = "bg-[#5B2596] text-white";
    } else if (reqProg.shownModelAnswer) {
      badgeText = "ظهر الحل";
      badgeClass = "bg-amber-100 text-amber-800";
    } else if (reqProg.theoryAnswer !== "" || reqProg.photo1 !== "") {
      badgeText = "تمت الإجابة";
      badgeClass = "bg-blue-100 text-blue-800";
    }

    accHtml += `
      <!-- Row container -->
      <div class="border border-[#D9D3F0] rounded-2xl overflow-hidden bg-white transition-all-custom shadow-sm">
        
        <!-- Accordion Header Button -->
        <button onclick="toggleRequirementRow('${q.id}', '${req.id}')" class="w-full px-5 py-4 flex justify-between items-center bg-white hover:bg-[#F5F3FF] transition-all-custom text-right font-extrabold focus:outline-none">
          <div class="flex items-center gap-3">
            <span class="text-sm md:text-base text-[#1D2433]">${req.title}</span>
            <span class="text-[10px] md:text-xs font-bold py-1 px-2.5 rounded-lg ${badgeClass}">${badgeText}</span>
          </div>
          <svg class="w-5 h-5 text-[#687084] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <!-- Accordion Content -->
        <div class="border-t border-[#D9D3F0] p-5 md:p-6 ${isExpanded ? '' : 'hidden'} bg-slate-50/50">
          
          <!-- Req Description -->
          <p class="text-sm md:text-base font-bold text-[#1D2433] mb-4">${renderMath(req.text)}</p>

          <!-- Input Fields based on type -->
          ${isTheory ? `
            <div class="flex flex-col gap-3">
              <label class="text-xs font-black text-[#687084]">اكتب إجابتك المطلوبة:</label>
              <textarea id="req-theory-${req.id}" rows="3" placeholder="اكتب إجابتك عن هذا الطلب..."
                class="w-full p-4 rounded-xl border-2 border-[#D9D3F0] focus:border-[#5B2596] focus:outline-none text-sm font-medium bg-white disabled:bg-gray-50 disabled:text-gray-500"
                ${reqProg.isConfirmed || reqProg.shownModelAnswer ? "disabled" : ""}>${reqProg.theoryAnswer}</textarea>
            </div>
          ` : `
            <!-- Calculation requirements uploads -->
            <div class="flex flex-col gap-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <!-- Photo 1 -->
                <div id="req-drop-1-${req.id}" class="border-2 border-dashed border-[#D9D3F0] rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white relative min-h-[150px]">
                  ${reqProg.photo1 ? `
                    <img src="${reqProg.photo1}" class="max-h-[110px] w-auto object-contain rounded-lg shadow-sm mb-2">
                    <div class="flex gap-2 z-10">
                      ${!(reqProg.isConfirmed || reqProg.shownModelAnswer) ? `
                        <button onclick="removePhoto('${q.id}', 1, '${req.id}')" class="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[10px] font-bold cursor-pointer">حذف</button>
                        <button onclick="triggerReqFileInput('${req.id}', 1)" class="px-2 py-1 bg-white border border-[#D9D3F0] text-[#5B2596] rounded-md text-[10px] font-bold cursor-pointer">تغيير</button>
                      ` : `<span class="text-[9px] bg-gray-100 text-gray-500 py-0.5 px-2 rounded font-bold">مغلق</span>`}
                    </div>
                  ` : `
                    <span class="text-xs font-bold text-[#1D2433]">صورة الحل 1 — مطلوبة</span>
                    ${!(reqProg.isConfirmed || reqProg.shownModelAnswer) ? `
                      <button onclick="triggerReqFileInput('${req.id}', 1)" class="mt-2.5 px-3 py-1.5 bg-[#5B2596] text-white text-[10px] font-bold rounded-lg cursor-pointer">اختر صورة</button>
                    ` : ""}
                  `}
                  <input type="file" id="req-file-1-${req.id}" accept="image/*" class="hidden">
                </div>

                <!-- Photo 2 -->
                <div id="req-drop-2-${req.id}" class="border-2 border-dashed border-[#D9D3F0] rounded-xl p-4 flex flex-col items-center justify-center text-center bg-white relative min-h-[150px]">
                  ${reqProg.photo2 ? `
                    <img src="${reqProg.photo2}" class="max-h-[110px] w-auto object-contain rounded-lg shadow-sm mb-2">
                    <div class="flex gap-2 z-10">
                      ${!(reqProg.isConfirmed || reqProg.shownModelAnswer) ? `
                        <button onclick="removePhoto('${q.id}', 2, '${req.id}')" class="px-2 py-1 bg-red-50 text-red-600 rounded-md text-[10px] font-bold cursor-pointer">حذف</button>
                        <button onclick="triggerReqFileInput('${req.id}', 2)" class="px-2 py-1 bg-white border border-[#D9D3F0] text-[#5B2596] rounded-md text-[10px] font-bold cursor-pointer">تغيير</button>
                      ` : `<span class="text-[9px] bg-gray-100 text-gray-500 py-0.5 px-2 rounded font-bold">مغلق</span>`}
                    </div>
                  ` : `
                    <span class="text-xs font-bold text-[#1D2433]">صورة الحل 2 — اختيارية</span>
                    ${!(reqProg.isConfirmed || reqProg.shownModelAnswer) ? `
                      <button onclick="triggerReqFileInput('${req.id}', 2)" class="mt-2.5 px-3 py-1.5 border border-[#5B2596] text-[#5B2596] text-[10px] font-bold rounded-lg cursor-pointer">أضف صورة</button>
                    ` : ""}
                  `}
                  <input type="file" id="req-file-2-${req.id}" accept="image/*" class="hidden">
                </div>

              </div>

              <!-- Note -->
              <div class="flex flex-col gap-1.5">
                <span class="text-xs font-bold text-[#687084]">ملاحظتك على الحل — اختيارية:</span>
                <textarea id="req-note-${req.id}" rows="1" placeholder="اكتب ملاحظة..."
                  class="w-full p-2.5 rounded-lg border-2 border-[#D9D3F0] focus:outline-none text-xs font-medium bg-white disabled:bg-gray-50"
                  ${reqProg.isConfirmed || reqProg.shownModelAnswer ? "disabled" : ""}>${reqProg.note}</textarea>
              </div>

              <!-- Autosave -->
              <div id="autosave-req-${req.id}" class="flex items-center gap-1 text-[10px] text-emerald-600 font-bold opacity-0 transition-all duration-300">
                <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>تم الحفظ تلقائياً</span>
              </div>
            </div>
          `}

          <!-- Model Answer trigger inside Accordion Row -->
          ${(isTheory ? reqProg.theoryAnswer !== "" : reqProg.photo1 !== "") ? `
            <div class="border border-[#D9D3F0] rounded-xl overflow-hidden mt-4 bg-[#F5F3FF]">
              <button onclick="toggleReqModelAnswer('${q.id}', '${req.id}')" class="w-full px-4 py-3 flex justify-between items-center bg-white font-bold text-xs md:text-sm text-[#1D2433]">
                <span class="flex items-center gap-1.5 text-[#5B2596]">
                  <svg class="w-4 h-4 text-[#5B2596]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  الجواب النموذجي من المصدر
                </span>
                <svg id="req-model-arrow-${req.id}" class="w-4 h-4 text-[#687084] transition-transform duration-300 ${reqProg.shownModelAnswer ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              
              <div id="req-model-content-${req.id}" class="p-4 border-t border-[#D9D3F0] bg-white ${reqProg.shownModelAnswer ? '' : 'hidden'}">
                ${renderModelAnswerContent(req, isTheory)}
              </div>
            </div>
          ` : ""}

          <!-- Evaluation inside nested accordion row -->
          ${reqProg.shownModelAnswer ? renderEvaluationGrid(q.id, reqProg, true, req.id) : ""}

        </div>
      </div>
    `;
  });

  accHtml += `</div>`;
  return accHtml;
}

// Sub-Renderer: Formats Model Answer content neatly
function renderModelAnswerContent(item, isTheory) {
  if (isTheory) {
    return `
      <div class="text-sm md:text-base text-[#1D2433] leading-relaxed font-semibold">
        ${renderMath(item.modelAnswer.theoryText)}
      </div>
    `;
  } else {
    // Calculation question output layout
    const m = item.modelAnswer;
    let html = `
      <div class="mx-auto max-w-[780px] w-full flex flex-col gap-4 text-[#1D2433] leading-relaxed select-text" dir="rtl">
    `;

    // 1. Idea (Arabic explanation if exists)
    if (m.idea) {
      html += `
        <p class="text-sm md:text-base font-semibold text-gray-700 text-right leading-relaxed mb-1" dir="rtl">
          ${renderMath(m.idea)}
        </p>
      `;
    }

    // 2. Given
    if (m.given && m.given.length > 0) {
      m.given.forEach(g => {
        html += `
          <div class="equation-block">
            ${renderMath(g)}
          </div>
        `;
      });
    }

    // 3. Law (the formula)
    if (m.law) {
      html += `
        <div class="equation-block">
          ${renderMath(m.law)}
        </div>
      `;
    }

    // 4. Substitution
    if (m.substitution && m.substitution.length > 0) {
      m.substitution.forEach(s => {
        html += `
          <div class="equation-block">
            ${renderMath(s)}
          </div>
        `;
      });
    }

    // 5. Steps (mathematical steps)
    if (m.steps && m.steps.length > 0) {
      m.steps.forEach(step => {
        html += `
          <div class="equation-block">
            ${renderMath(step)}
          </div>
        `;
      });
    }

    // 6. Final Answer (slightly stronger visual emphasis, without adding a title)
    if (m.finalAnswer) {
      html += `
        <div class="equation-block bg-[#F4F1FD] border-2 border-[#DCD6F7] font-extrabold text-base md:text-lg py-3.5 rounded-xl text-[#5B2596]">
          ${renderMath(m.finalAnswer)}
        </div>
      `;
    }

    html += `
      </div>
    `;
    return html;
  }
}

// Sub-Renderer: Visual self-evaluation system block
function renderEvaluationGrid(qId, prog, isRequirement = false, reqId = null) {
  const selected = prog.selectedScore;
  const isConfirmed = prog.isConfirmed;

  // Final deducted calculations if checkbox checked
  const hasErr = prog.hasCalculationError;
  const finalScore = hasErr ? Math.max(0, selected - 1) : selected;
  const key = `${qId}_${reqId || 'single'}`;

  // Find if this question is a calculation type
  const isCalculation = (window.examData.questions.find(item => item.id === parseInt(qId)).type === 'calculation');

  return `
    <div class="mt-6 border-t border-[#D9D3F0] pt-6 flex flex-col gap-5 animate-slideUp" dir="rtl">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-6 bg-[#5B2596] rounded-full"></span>
        <h4 class="text-sm md:text-base font-extrabold text-[#1D2433]">قيّم إجابتك بعد مراجعة ومطابقة الحل:</h4>
      </div>

      <!-- Selectable numbers grid -->
      <div class="flex flex-wrap gap-2 justify-center py-2">
        ${Array.from({ length: 11 }).map((_, val) => {
          const isCurrent = selected === val;
          const bgClass = isCurrent ? 'bg-[#5B2596] text-white shadow-md scale-105' : 'bg-white text-[#5B2596] border border-[#D9D3F0] hover:bg-[#E9E6FA]/40 hover:border-[#5B2596]';
          const disabledAttr = isConfirmed ? 'disabled' : '';
          return `
            <button onclick="selectScore('${qId}', ${val}, ${isRequirement}, '${reqId}')" ${disabledAttr} 
              class="score-bubble font-black transition-all-custom ${bgClass} disabled:opacity-60 disabled:cursor-not-allowed">
              ${val}
            </button>
          `;
        }).join("")}
      </div>

      <!-- Detail status and calculations -->
      <div class="flex flex-col gap-3 bg-[#F5F3FF] border border-[#D9D3F0] rounded-2xl p-4">
        
        <div class="flex justify-between items-center">
          <span class="text-xs md:text-sm font-bold text-[#1D2433]">التقييم المختار:</span>
          <span class="text-sm md:text-base font-extrabold text-[#5B2596]">
            ${selected !== null ? `${selected}/10` : "لم يتم الاختيار بعد"}
          </span>
        </div>

        <!-- Calculation Error block (Only shown for calculations) -->
        ${isCalculation ? `
          <div class="border-t border-[#D9D3F0] pt-3 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <input type="checkbox" id="calc-err-check-${key}" ${hasErr ? 'checked' : ''} ${isConfirmed ? 'disabled' : ''} 
                onchange="toggleCalculationError('${qId}', ${isRequirement}, '${reqId}')"
                class="w-5 h-5 accent-[#5B2596] rounded border-[#D9D3F0] disabled:cursor-not-allowed cursor-pointer">
              <label for="calc-err-check-${key}" class="text-xs font-bold text-[#1D2433] select-none cursor-pointer flex items-center gap-1.5">
                <span class="text-[10px] bg-[#E9E6FA] text-[#7641B4] px-1.5 py-0.5 rounded-md font-bold">اختياري</span>
                <span>يوجد خطأ حسابي في حلي المرفق</span>
              </label>
            </div>
          </div>
          
          ${hasErr && selected !== null ? `
            <div class="flex justify-between items-center text-xs font-bold text-[#687084] border-t border-[#E2DBF7] pt-2">
              <span>خصم الخطأ الحسابي:</span>
              <span class="font-mono text-[#7641B4] font-black">−1</span>
            </div>
          ` : ""}
        ` : ""}

        <!-- Total deduction summary -->
        ${selected !== null ? `
          <div class="border-t border-[#D9D3F0] pt-3 flex justify-between items-center font-extrabold">
            <span class="text-xs md:text-sm text-[#1D2433]">${isConfirmed ? 'التقييم النهائي:' : 'التقييم النهائي المحفوظ:'}</span>
            <span id="final-eval-label" class="text-sm md:text-base text-[#5B2596]">
              ${finalScore}/10
            </span>
          </div>
        ` : ""}

      </div>

      <!-- Action confirmations buttons -->
      ${!isConfirmed ? `
        <!-- Validation Error Message container -->
        ${state.validationErrors && state.validationErrors[key] ? `
          <div class="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100 text-right">
            ${state.validationErrors[key]}
          </div>
        ` : ""}
        <button onclick="confirmScore('${qId}', ${isRequirement}, '${reqId}')"
          class="w-full py-3 px-5 bg-[#5B2596] hover:bg-[#3E176D] text-white font-extrabold text-sm md:text-base rounded-xl transition-all-custom flex items-center justify-center gap-1.5 cursor-pointer">
          <svg class="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 10 21a3.745 3.745 0 0 1-3.068-1.593 3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 14 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12z" />
          </svg>
          <span>تثبيت التقييم</span>
        </button>
      ` : `
        <div class="bg-[#E9E6FA] border border-[#5B2596]/30 text-[#5B2596] rounded-xl py-3 px-4 text-center font-extrabold text-xs md:text-sm flex flex-col items-center justify-center gap-1">
          <div class="flex items-center gap-1.5">
            <svg class="w-5 h-5 text-[#5B2596]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043a3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <span>تم تثبيت التقييم</span>
          </div>
          <span class="text-sm font-black mt-1">مقيّم: ${finalScore}/10</span>
        </div>
      `}

    </div>
  `;
}

// Attach event listeners for elements inside Screen 2
function setupScreenListeners(q, qProg) {
  // Toggle model answer accordion trigger
  const modelToggleBtn = document.getElementById("model-answer-toggle-btn");
  const modelContent = document.getElementById("model-answer-content");
  const modelArrow = document.getElementById("model-arrow");

  if (modelToggleBtn) {
    modelToggleBtn.addEventListener("click", () => {
      modelContent.classList.toggle("hidden");
      modelArrow.classList.toggle("rotate-180");
      
      if (!qProg.shownModelAnswer) {
        qProg.shownModelAnswer = true;
        persistCurrentState();
        render(); // Reload to show self-evaluation underneath
      }
    });
  }

  // Textarea listeners for auto-save (on input change or focus loss)
  const theoryInput = document.getElementById("theory-answer-input");
  if (theoryInput) {
    theoryInput.addEventListener("blur", () => {
      const oldVal = qProg.theoryAnswer;
      qProg.theoryAnswer = theoryInput.value.trim();
      if (oldVal !== qProg.theoryAnswer) {
        persistCurrentState();
        render();
      }
    });
    // Triggers render of model-answer folded trigger if they start typing
    theoryInput.addEventListener("input", () => {
      if (theoryInput.value.trim().length > 0 && qProg.theoryAnswer === "") {
        qProg.theoryAnswer = theoryInput.value.trim();
        persistCurrentState();
        render();
      }
    });
  }

  // Desktop drag and drop event listeners for calculations
  if (q.type === 'calculation' && !q.requirements) {
    setupDragDropZone(1, q.id);
    setupDragDropZone(2, q.id);

    const noteInput = document.getElementById("note-input");
    if (noteInput) {
      noteInput.addEventListener("blur", () => {
        qProg.note = noteInput.value.trim();
        persistCurrentState();
      });
    }
  }

  // Setup mobile navigation panel triggers
  const mobileNavToggle = document.getElementById("mobile-nav-panel-toggle");
  const mobileNavClose = document.getElementById("mobile-nav-panel-close");
  const mobileOverlay = document.getElementById("question-panel-overlay");
  const mobilePanel = document.getElementById("question-panel");

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener("click", () => {
      mobileOverlay.classList.remove("hidden");
      setTimeout(() => {
        mobilePanel.classList.remove("translate-x-full");
      }, 20);
    });
  }

  const closeMobileDrawer = () => {
    mobilePanel.classList.add("translate-x-full");
    setTimeout(() => {
      mobileOverlay.classList.add("hidden");
    }, 300);
  };

  if (mobileNavClose) {
    mobileNavClose.addEventListener("click", closeMobileDrawer);
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", (e) => {
      if (e.target === mobileOverlay) closeMobileDrawer();
    });
  }

  // Requirements text areas auto-save setup
  if (q.requirements && q.requirements.length > 0) {
    q.requirements.forEach(req => {
      const isTheory = q.type === "theory" || (!req.modelAnswer.law);
      if (isTheory) {
        const reqTextarea = document.getElementById(`req-theory-${req.id}`);
        if (reqTextarea) {
          reqTextarea.addEventListener("blur", () => {
            const oldVal = qProg.requirements[req.id].theoryAnswer;
            qProg.requirements[req.id].theoryAnswer = reqTextarea.value.trim();
            if (oldVal !== qProg.requirements[req.id].theoryAnswer) {
              persistCurrentState();
              render();
            }
          });
          reqTextarea.addEventListener("input", () => {
            if (reqTextarea.value.trim().length > 0 && qProg.requirements[req.id].theoryAnswer === "") {
              qProg.requirements[req.id].theoryAnswer = reqTextarea.value.trim();
              persistCurrentState();
              render();
            }
          });
        }
      } else {
        // Dropzones for compound requirements
        setupDragDropZone(1, q.id, req.id);
        setupDragDropZone(2, q.id, req.id);

        const reqNote = document.getElementById(`req-note-${req.id}`);
        if (reqNote) {
          reqNote.addEventListener("blur", () => {
            qProg.requirements[req.id].note = reqNote.value.trim();
            persistCurrentState();
          });
        }
      }
    });
  }

  // Navigation finish button click triggers transition
  const finishBtn = document.getElementById("btn-finish-exam");
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      state.currentScreen = "end";
      persistCurrentState();
      render();
    });
  }

  const drawerFinishBtn = document.getElementById("btn-drawer-finish-exam");
  if (drawerFinishBtn) {
    drawerFinishBtn.addEventListener("click", () => {
      closeMobileDrawer();
      setTimeout(() => {
        state.currentScreen = "end";
        persistCurrentState();
        render();
      }, 310);
    });
  }
}

// Drag & Drop engine setup
function setupDragDropZone(slot, qId, reqId = null) {
  const zoneId = reqId ? `req-drop-${slot}-${reqId}` : `drop-zone-${slot}`;
  const inputId = reqId ? `req-file-slot-${slot}-${reqId}` : `file-input-${slot}`; // wait, input elements are dynamically processed
  const zone = document.getElementById(zoneId);
  const input = reqId ? document.getElementById(`req-file-${slot}-${reqId}`) : document.getElementById(`file-input-${slot}`);

  if (!zone || !input) return;

  // Click trigger helper
  zone.style.cursor = "pointer";

  // Drag listeners
  ["dragenter", "dragover"].forEach(eventName => {
    zone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add("drag-over");
    }, false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    zone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.remove("drag-over");
    }, false);
  });

  // Handle file drop
  zone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      processPhotoUpload(files[0], slot, qId, reqId);
    }
  });

  // Change / Upload click trigger
  input.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      processPhotoUpload(e.target.files[0], slot, qId, reqId);
    }
  });
}

// Read and save file
function processPhotoUpload(file, slot, qId, reqId = null) {
  if (!file.type.startsWith("image/")) {
    alert("يرجى اختيار ملف صورة صالح فقط.");
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async () => {
    const base64Str = reader.result;
    
    if (reqId) {
      state.progress[qId].requirements[reqId][`photo${slot}`] = base64Str;
    } else {
      state.progress[qId][`photo${slot}`] = base64Str;
    }

    await persistCurrentState();
    render();

    // Trigger auto-save notification
    const indicatorId = reqId ? `autosave-req-${reqId}` : "autosave-indicator";
    const indicator = document.getElementById(indicatorId);
    if (indicator) {
      indicator.classList.remove("opacity-0", "translate-y-1");
      setTimeout(() => {
        indicator.classList.add("opacity-0", "translate-y-1");
      }, 3000);
    }
  };
}

// Navigation event functions exposed globally
window.navigateToQuestion = (idx) => {
  state.currentQuestionIndex = idx;
  persistCurrentState();
  render();
};

window.navigateToQuestionMobile = (idx) => {
  state.currentQuestionIndex = idx;
  persistCurrentState();
  render();
};

window.navigateNext = () => {
  if (state.currentQuestionIndex < window.examData.questions.length - 1) {
    state.currentQuestionIndex++;
    persistCurrentState();
    render();
  }
};

window.navigatePrevious = () => {
  if (state.currentQuestionIndex > 0) {
    state.currentQuestionIndex--;
    persistCurrentState();
    render();
  } else {
    // Go back to home screen immediately
    state.currentScreen = "home";
    persistCurrentState();
    render();
  }
};

window.selectChoice = async (qId, choice) => {
  const qProg = state.progress[qId];
  if (qProg && !qProg.isConfirmed && !qProg.shownModelAnswer) {
    qProg.theoryAnswer = choice;
    await persistCurrentState();
    render();
  }
};

// Handle custom button inputs
window.triggerFileInput = (slot) => {
  const input = document.getElementById(`file-input-${slot}`);
  if (input) input.click();
};

window.triggerReqFileInput = (reqId, slot) => {
  const input = document.getElementById(`req-file-${slot}-${reqId}`);
  if (input) input.click();
};

// Handle photo removal
window.removePhoto = async (qId, slot, reqId = null) => {
  if (confirm("هل أنت متأكد من حذف هذه الصورة؟")) {
    if (reqId) {
      state.progress[qId].requirements[reqId][`photo${slot}`] = "";
    } else {
      state.progress[qId][`photo${slot}`] = "";
    }
    await persistCurrentState();
    render();
  }
};

// Connected Accordion Row collapse toggler
window.toggleRequirementRow = (qId, reqId) => {
  state.activeRequirementId[qId] = reqId;
  persistCurrentState();
  render();
};

// Nested requirements model-answer reveal toggler
window.toggleReqModelAnswer = (qId, reqId) => {
  const reqProg = state.progress[qId].requirements[reqId];
  const content = document.getElementById(`req-model-content-${reqId}`);
  const arrow = document.getElementById(`req-model-arrow-${reqId}`);

  if (content && arrow) {
    content.classList.toggle("hidden");
    arrow.classList.toggle("rotate-180");
    
    if (!reqProg.shownModelAnswer) {
      reqProg.shownModelAnswer = true;
      persistCurrentState();
      render();
    }
  }
};

// Score picker trigger
window.selectScore = (qId, val, isRequirement = false, reqId = null) => {
  const key = `${qId}_${reqId || 'single'}`;
  if (state.validationErrors && state.validationErrors[key]) {
    delete state.validationErrors[key];
  }

  if (isRequirement) {
    state.progress[qId].requirements[reqId].selectedScore = val;
  } else {
    state.progress[qId].selectedScore = val;
  }
  persistCurrentState();
  render();
};

// Confirms score picker block forever
window.confirmScore = async (qId, isRequirement = false, reqId = null) => {
  const key = `${qId}_${reqId || 'single'}`;
  let prog;
  if (isRequirement) {
    prog = state.progress[qId].requirements[reqId];
  } else {
    prog = state.progress[qId];
  }

  if (prog.selectedScore === null) {
    state.validationErrors = state.validationErrors || {};
    state.validationErrors[key] = "اختر تقييماً أولاً";
    render();
    return;
  }

  // Clear validation error if any
  if (state.validationErrors && state.validationErrors[key]) {
    delete state.validationErrors[key];
  }

  prog.isConfirmed = true;
  await persistCurrentState();
  render();
};

// Calculation error deduction toggle
window.toggleCalculationError = (qId, isRequirement = false, reqId = null) => {
  let prog;
  if (isRequirement) {
    prog = state.progress[qId].requirements[reqId];
  } else {
    prog = state.progress[qId];
  }
  prog.hasCalculationError = !prog.hasCalculationError;
  persistCurrentState();
  render();
};

// ==========================================
// SCREEN 3: END OF EXAM SCREEN
// ==========================================
function renderEndScreen(container) {
  const endHtml = `
    <div class="w-full max-w-2xl mx-auto py-4 animate-fadeIn flex flex-col gap-6">
      
      <!-- Top Splash Card -->
      <div class="bg-white rounded-3xl p-6 md:p-8 card-shadow premium-border text-center flex flex-col items-center gap-4 relative overflow-hidden">
        <div class="absolute right-0 left-0 top-0 h-2 bg-[#5B2596]"></div>

        <div class="w-16 h-16 bg-[#E9E6FA] rounded-full flex items-center justify-center mb-1">
          <!-- Big checkmark badge -->
          <svg class="w-8 h-8 text-[#5B2596]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110 21a3.745 3.745 0 01-3.068-1.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0114 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        </div>

        <h1 class="text-2xl md:text-3xl font-black text-[#1D2433]">نهاية الامتحان</h1>
        <p class="text-sm md:text-base font-bold text-[#687084]">أكملت تقييم جميع الأسئلة</p>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mb-6">
        
        <button id="btn-restart-exam" type="button" class="py-4 px-6 border-2 border-red-500 hover:bg-red-50 text-red-500 font-extrabold text-base rounded-2xl transition-all-custom flex items-center justify-center gap-2 cursor-pointer bg-transparent">
          <svg class="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span>إعادة الامتحان من الصفر</span>
        </button>

        <button id="btn-return-home" type="button" class="py-4 px-6 bg-[#5B2596] hover:bg-[#3E176D] text-white font-extrabold text-base rounded-2xl transition-all-custom flex items-center justify-center gap-2 cursor-pointer shadow-md border-0">
          <svg class="w-5 h-5 stroke-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span>العودة للرئيسية</span>
        </button>

      </div>

    </div>
  `;

  container.innerHTML = endHtml;

  // Setup Event Triggers
  document.getElementById("btn-return-home").addEventListener("click", () => {
    state.currentScreen = "home";
    persistCurrentState();
    render();
  });

  document.getElementById("btn-restart-exam").addEventListener("click", (e) => {
    e.preventDefault();
    showResetConfirmationModal(async () => {
      await resetExamAttempt();
    });
  });
}

// LaTeX Scientific Expression parser and renderer (does not rely on external CDNs)
function wrapInlineScientificTokens(text) {
  if (!text) return "";

  // Comprehensive regex matching numbers with units, formulas, chemical expressions, and isolated variables
  const scientificRegex = /(?:[−\-+]?\d+(?:\.\d+)?\s*(?:°C|°|J\/\(g·°C\)|J\/g·°C|J\/°C|J|g|kg|kJ|S)(?![a-zA-Z0-9])|ΔT\s*=\s*T_f\s*−\s*T_i\s*=\s*\d+\s*−\s*\d+\s*=\s*\d+\s*°C|q\s*=\s*S\s*×\s*m\s*×\s*ΔT|ΔT\s*=\s*T_f\s*−\s*T_i|C\s*=\s*S\s*×\s*m|205\s*=\s*S\s*×\s*8\s*×\s*25|205\s*=\s*200\s*×\s*S|S\s*=\s*205\s*\/\s*200|\b(?:T_[fi]|T[ᵢ_f_i]|q|C|S|m|ΔT)\s*=\s*[−\-+]?\d+(?:\.\d+)?\s*(?:°C|°|J\/\(g·°C\)|J\/g·°C|J\/°C|J|g|kg|kJ|S)?|\bT_[fi]\b|\bT[ᵢ_f_i]\b|ΔT|\b[qCSm]\b|H⁺|\[HCl\]|pH\s*=\s*−?log\s*\[H⁺\])/g;

  return text.replace(scientificRegex, (match) => {
    if (!match.trim()) return match;
    
    // Format subscripts and superscripts inside the inline token
    let formatted = match;
    formatted = formatted.replace(/_([A-Za-z0-9+-])/g, "<sub>$1</sub>");
    formatted = formatted.replace(/_\{([^{}]+)\}/g, "<sub>$1</sub>");
    formatted = formatted.replace(/\^([A-Za-z0-9+-])/g, "<sup>$1</sup>");
    formatted = formatted.replace(/\^\{([^{}]+)\}/g, "<sup>$1</sup>");
    
    // Clean up remaining underscores and carets
    formatted = formatted.replace(/_/g, "");
    formatted = formatted.replace(/\^/g, "");

    return `<bdi dir="ltr" class="scientific-inline">${formatted}</bdi>`;
  });
}

function renderMath(text) {
  if (!text) return "";
  
  // 1. Find all LaTeX blocks delimited by \( and \) and render them beautifully
  const regex = /\\\((.*?)\\\)/g;
  let html = text.replace(regex, (match, formula) => {
    return formatLaTeXFormula(formula);
  });

  // 2. Tokenize by HTML tags and wrap plain text scientific content
  const tokens = html.split(/(<[^>]+>)/g);
  let result = "";
  let insideScientific = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith("<") && token.endsWith(">")) {
      const lower = token.toLowerCase();
      // If we are inside an equation or scientific tag, increment counter
      if (lower.includes('class="scientific-equation') || lower.includes('class="equation-block') || lower.includes('class="math-frac') || lower.includes('class="scientific-inline')) {
        insideScientific++;
      }
      if (lower.startsWith("</span") || lower.startsWith("</div") || lower.startsWith("</bdi")) {
        if (insideScientific > 0) {
          insideScientific--;
        }
      }
      result += token;
    } else {
      if (insideScientific > 0) {
        result += token;
      } else {
        result += wrapInlineScientificTokens(token);
      }
    }
  }

  return result;
}

function formatLaTeXFormula(formula) {
  if (!formula) return "";
  
  let result = formula;

  // 1. Preprocess specific symbols
  result = result.replace(/\^\\circ/g, "°");
  result = result.replace(/\\circ/g, "°");
  result = result.replace(/\\Delta/g, "Δ");
  result = result.replace(/\\circC/g, "°C");
  result = result.replace(/\\times/g, "×");
  result = result.replace(/\\cdot/g, "·");
  result = result.replace(/\\minus/g, "−");
  result = result.replace(/\\pm/g, "±");
  result = result.replace(/\\rightarrow/g, "→");
  result = result.replace(/\\lefttarrow/g, "←");
  result = result.replace(/\\to/g, "→");
  result = result.replace(/\\approx/g, "≈");
  result = result.replace(/\\lambda/g, "λ");
  result = result.replace(/\\alpha/g, "α");
  result = result.replace(/\\implies/g, "⇒");

  // Clean thin spaces or standard spaces
  result = result.replace(/\\,/g, " ");
  result = result.replace(/\\ /g, " ");

  // 2. Handle fractions recursively to support nesting
  let safeFrac = 0;
  while (result.includes("\\frac") && safeFrac < 10) {
    result = result.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, (m, num, den) => {
      return `<span class="math-frac inline-flex flex-col align-middle text-center mx-1 text-xs md:text-sm"><span class="border-b border-[#D9D3F0] pb-0.5 leading-none px-1 text-[#7641B4] font-semibold">${num}</span><span class="pt-0.5 leading-none px-1 text-[#7641B4] font-semibold">${den}</span></span>`;
    });
    safeFrac++;
  }

  // 3. Handle square roots
  let safeSqrt = 0;
  while (result.includes("\\sqrt") && safeSqrt < 10) {
    result = result.replace(/\\sqrt\s*\{([^{}]+)\}/g, (m, radicand) => {
      return `<span class="inline-flex items-center align-middle"><span class="text-lg leading-none font-sans" style="margin-right: 1px; color: #7641B4;">&radic;</span><span class="border-t border-[#7641B4] px-1 pb-0.5 leading-none" style="margin-top: 1px;">${radicand}</span></span>`;
    });
    safeSqrt++;
  }

  // Strip \mathrm{} and \text{} recursively
  let safeRm = 0;
  while ((result.includes("\\mathrm") || result.includes("\\text")) && safeRm < 10) {
    result = result.replace(/\\mathrm\{([^{}]+)\}/g, "$1");
    result = result.replace(/\\text\{([^{}]+)\}/g, "$1");
    safeRm++;
  }

  // 4. Superscripts and subscripts
  // Bracketed superscripts: ^{something}
  result = result.replace(/\^\{([^{}]+)\}/g, "<sup>$1</sup>");
  // Bracketed subscripts: _{something}
  result = result.replace(/_\{([^{}]+)\}/g, "<sub>$1</sub>");

  // Advanced exponents like ^-2, ^-50, ^+3
  result = result.replace(/\^([+-]?\d+)/g, "<sup>$1</sup>");
  // Single-character superscripts: ^+ or ^- or ^2
  result = result.replace(/\^([A-Za-z0-9+-])/g, "<sup>$1</sup>");
  // Single-character subscripts: _a or _c or _f or _i
  result = result.replace(/_([A-Za-z0-9+-])/g, "<sub>$1</sub>");

  // Standalone minus signs or negative numbers
  result = result.replace(/\s-\s/g, " − ");
  result = result.replace(/-(\d+)/g, "−$1");

  // 5. Hard Sanitization Step to ensure NO raw LaTeX commands, backslashes, braces, carets or underscores escape
  result = result.replace(/\\mathrm/g, "");
  result = result.replace(/\\text/g, "");
  result = result.replace(/\\left/g, "");
  result = result.replace(/\\right/g, "");
  result = result.replace(/\\/g, "");
  result = result.replace(/[{}]/g, "");
  result = result.replace(/\^/g, "");
  result = result.replace(/_/g, "");

  // Wrap in a span with scientific equation styling
  return `<span class="scientific-equation select-text">${result}</span>`;
}
