const SIMULATION_MOUNTERS = {
  "bitplane": mountSimulation_bitplane,
  "ctf": mountSimulation_ctf,
  "hash-demo": mountSimulation_hashdemo,
  "kdf-visualizer": mountSimulation_kdfvisualizer,
  "compare": mountSimulation_compare,
  "detector": mountSimulation_detector
};

function initLessonPage() {
  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get("lesson");
  const level = params.get("level") || "basic";

  const lesson = LESSONS[lessonId];
  const root = document.getElementById("lesson-root");

  if (!lesson || !lesson[level]) {
    root.innerHTML = `<div class="note note-warning">Lesson not found.</div>`;
    return;
  }

  const data = lesson[level];
  document.title = `${lesson.title} (${level}) — StegoTool Pro Learning Lab`;

  document.getElementById("lesson-eyebrow").textContent =
    `${lesson.icon} ${lesson.title} · ${level === "basic" ? "Basic" : "Advanced"}`;
  document.getElementById("lesson-badge").innerHTML = data.free
    ? `<span class="badge badge-free">Free</span>`
    : isProUnlocked()
    ? `<span class="badge badge-pro">Pro · Unlocked</span>`
    : `<span class="badge badge-pro">Pro</span>`;

  if (!data.free && !isProUnlocked()) {
    renderLocked(root, lesson, level);
    return;
  }

  renderFull(root, lessonId, lesson, level, data);
}

function renderLocked(root, lesson, level) {
  root.innerHTML = `
    <div class="note note-warning" style="margin-bottom: 20px;">
      This is a Pro-tier lesson. Checkout isn't live yet -- see
      <a href="advanced.html">Advanced Techniques</a> for what's coming.
    </div>
    <div class="card locked">
      ${lesson[level].theory.map((s) => `<h3>${s.heading}</h3><p>${s.body}</p>${s.diagram && DIAGRAMS[s.diagram] ? DIAGRAMS[s.diagram] : ""}`).join("")}
    </div>
    <div class="card" style="text-align:center;">
      <h2>Unlock ${lesson.title} Advanced</h2>
      <p style="color: var(--text-muted);">Full theory, a hands-on simulation, and a graded quiz -- once Pro tier is live.</p>
      <a class="btn btn-primary" href="pricing.html">See Pricing</a>
    </div>
  `;
}

function renderFull(root, lessonId, lesson, level, data) {
  root.innerHTML = `
    <div class="card">
      ${data.theory.map((s) => `
        <h3>${s.heading}</h3>
        <p style="color: var(--text-muted); line-height: 1.6;">${s.body}</p>
        ${s.diagram && DIAGRAMS[s.diagram] ? DIAGRAMS[s.diagram] : ""}
      `).join("")}
    </div>

    <div class="card">
      <h2>Try it</h2>
      <div id="sim-container"></div>
    </div>

    <div class="card">
      <h2>Summary</h2>
      <ul style="color: var(--text-muted); line-height: 1.9;">
        ${data.summary.map((s) => `<li>${s}</li>`).join("")}
      </ul>
    </div>

    <div class="card" id="quiz-card">
      <h2>Check your understanding</h2>
      <p style="color: var(--text-muted);">Get ${Math.ceil(data.quiz.length * 0.7)} of ${data.quiz.length} correct to pass this level.</p>
      <div id="quiz-body"></div>
    </div>
  `;

  const simMounter = SIMULATION_MOUNTERS[data.simulation];
  if (simMounter) simMounter(document.getElementById("sim-container"));

  mountLessonQuiz(document.getElementById("quiz-body"), lessonId, level, data.quiz, lesson.title);
}

function mountLessonQuiz(container, lessonId, level, questions, lessonTitle) {
  let current = 0;
  let score = 0;

  function renderQuestion() {
    const q = questions[current];
    container.innerHTML = `
      <p style="color: var(--text-muted); margin-bottom: 4px;">Question ${current + 1} of ${questions.length}</p>
      <h3 style="margin-top: 0;">${q.q}</h3>
      <div id="lq-options"></div>
      <div id="lq-explain" class="note" style="display:none; margin-top: 12px;"></div>
      <div style="margin-top: 16px;">
        <button id="lq-next" class="btn btn-primary" style="display:none;"></button>
      </div>
    `;

    const optionsEl = container.querySelector("#lq-options");
    q.options.forEach((opt, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = opt;
      btn.onclick = () => selectAnswer(q, idx);
      optionsEl.appendChild(btn);
    });
  }

  function selectAnswer(q, idx) {
    const buttons = container.querySelectorAll(".quiz-option");
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correct) btn.classList.add("correct");
      else if (i === idx) btn.classList.add("incorrect");
    });
    if (idx === q.correct) score++;

    const explainEl = container.querySelector("#lq-explain");
    explainEl.textContent = q.explain;
    explainEl.style.display = "block";

    const nextBtn = container.querySelector("#lq-next");
    nextBtn.textContent = current === questions.length - 1 ? "See results" : "Next question";
    nextBtn.style.display = "inline-flex";
    nextBtn.onclick = () => {
      current++;
      if (current >= questions.length) showResults();
      else renderQuestion();
    };
  }

  function showResults() {
    const result = recordQuizResult(lessonId, level, score, questions.length);
    const bothDone = isLessonComplete(lessonId);

    container.innerHTML = `
      <h2>${score} / ${questions.length}</h2>
      ${result.passed
        ? `<div class="note" style="border-color: var(--success); color: var(--text);">You passed this level (${Math.round(result.percent * 100)}%).</div>`
        : `<div class="note note-warning">Not quite -- you need ${Math.ceil(questions.length * PASS_THRESHOLD)} correct to pass. Give it another go.</div>`
      }
      <div style="display:flex; gap:12px; margin-top:20px; flex-wrap: wrap;">
        <button class="btn btn-outline" id="lq-retry">Try again</button>
        <a class="btn btn-outline" href="index.html">Back to Learning Lab</a>
        ${bothDone ? `<a class="btn btn-primary" href="certificate.html?lesson=${lessonId}">🎓 Get your certificate</a>` : ""}
      </div>
      ${!bothDone && result.passed ? `<p class="sim-hint" style="margin-top:12px;">Pass both Basic and Advanced levels of ${lessonTitle} to unlock a certificate.</p>` : ""}
    `;
    container.querySelector("#lq-retry").onclick = () => { current = 0; score = 0; renderQuestion(); };
  }

  renderQuestion();
}

document.addEventListener("DOMContentLoaded", initLessonPage);
