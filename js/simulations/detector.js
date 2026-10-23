/**
 * Steganalysis / Advanced simulation: runs the real, verified chi-square and
 * PVD-boundary detectors (js/steganalysis-math.js) on an image you pick.
 * Same algorithms as the app, checked against its own test vectors.
 */
function mountSimulation_detector(container) {
  container.innerHTML = `
    <div id="det-drop-zone" class="drop-zone">
      <p style="margin: 0;">Click to choose an image, or drag one here</p>
      <input type="file" id="det-file-input" accept="image/*" style="display:none;">
    </div>
    <div class="controls" style="margin-top: 12px;">
      <button id="det-sample-btn" class="btn btn-outline">Or try it on the sample pair from Basic</button>
    </div>
    <div id="det-results" style="display:none; margin-top: 16px;"></div>
  `;

  const fileInput = container.querySelector("#det-file-input");
  const dropZone = container.querySelector("#det-drop-zone");
  const sampleBtn = container.querySelector("#det-sample-btn");
  const resultsBox = container.querySelector("#det-results");

  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => { if (e.target.files[0]) analyzeFile(e.target.files[0]); });
  dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) analyzeFile(file);
  });

  sampleBtn.addEventListener("click", () => analyzeUrl("assets/compare-stego.png", "compare-stego.png (from Basic)"));

  function analyzeFile(file) {
    analyzeUrl(URL.createObjectURL(file), file.name);
  }

  function analyzeUrl(url, label) {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      runDetectors(imageData, label);
    };
    img.src = url;
  }

  function runDetectors(imageData, label) {
    let chi2Result, pvdResult, error = null;
    try {
      const rgbBytes = allRgbBytes(imageData);
      chi2Result = chiSquareAttack(rgbBytes);
    } catch (e) { error = e.message; }

    try {
      const { gray, width, height } = toGrayscale(imageData);
      pvdResult = pvdBoundaryArtifactScore(gray, width, height);
    } catch (e) { /* image too small for pair analysis, leave undefined */ }

    resultsBox.style.display = "block";
    resultsBox.innerHTML = `
      <p class="sim-hint">Analyzed: <strong>${label}</strong></p>
      ${chi2Result ? `
        <div class="card" style="padding: 16px;">
          <h3 style="margin-top:0;">Chi-square attack (LSB signal)</h3>
          <p>Probability consistent with LSB embedding:
            <strong>${(chi2Result.probabilityOfEmbedding * 100).toFixed(2)}%</strong></p>
          <p class="sim-hint">Statistic: ${chi2Result.statistic.toFixed(2)}, degrees of freedom:
            ${chi2Result.degreesOfFreedom}, pairs used: ${chi2Result.pairsUsed}</p>
          <p class="sim-hint">${interpretChiSquare(chi2Result.probabilityOfEmbedding)}</p>
        </div>
      ` : `<div class="note note-warning">Chi-square attack failed: ${error}</div>`}
      ${pvdResult ? `
        <div class="card" style="padding: 16px; margin-top: 12px;">
          <h3 style="margin-top:0;">PVD boundary-artifact score</h3>
          <p>Boundary-to-control curvature ratio: <strong>${pvdResult.ratio === Infinity ? "∞" : pvdResult.ratio.toFixed(2)}</strong></p>
          <p class="sim-hint">Boundary score: ${pvdResult.boundaryScore.toFixed(2)}, control score:
            ${pvdResult.controlScore.toFixed(2)}, pairs analyzed: ${pvdResult.pairsAnalyzed}</p>
          <p class="sim-hint">${interpretPvd(pvdResult.ratio)}</p>
        </div>
      ` : `<div class="note note-warning">PVD boundary test needs a larger image to analyze.</div>`}
      <div class="note" style="margin-top: 12px;">
        Neither result is a verdict -- both are signals. A clean, noisy photo can trip
        either test by chance, and a well-hidden payload using a different technique
        (spread spectrum, for instance) can slip past both.
      </div>
    `;
  }

  function interpretChiSquare(p) {
    if (p >= 0.9) return "Strong signal of LSB-style hidden data.";
    if (p >= 0.5) return "Some signal of possible hidden data.";
    return "No strong signal of LSB-style hidden data.";
  }

  function interpretPvd(ratio) {
    if (ratio === Infinity || ratio >= 3.0) return "Possible PVD-style hidden data.";
    if (ratio >= 1.5) return "Weak signal of possible PVD-style hidden data.";
    return "No signal of PVD-style hidden data.";
  }
}
