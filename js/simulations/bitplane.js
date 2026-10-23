/** Steganography / Basic simulation: the Bit-Plane Inspector. */
function mountSimulation_bitplane(container) {
  container.innerHTML = `
    <div id="drop-zone" class="drop-zone">
      <p style="margin: 0;">Click to choose an image, or drag one here</p>
      <input type="file" id="bp-file-input" accept="image/*" style="display:none;">
    </div>
    <div id="bp-workspace" style="display:none;">
      <div class="controls">
        <label>Channel:
          <select id="bp-channel-select">
            <option value="0">Red</option>
            <option value="1">Green</option>
            <option value="2">Blue</option>
          </select>
        </label>
        <label style="flex: 1; min-width: 200px;">
          Bit: <input type="range" id="bp-bit-slider" min="0" max="7" value="0" style="width: 100%;">
        </label>
      </div>
      <p id="bp-bit-label" class="sim-hint"></p>
      <div class="canvas-row">
        <div class="canvas-col"><canvas id="bp-source-canvas"></canvas><p>Original</p></div>
        <div class="canvas-col"><canvas id="bp-plane-canvas"></canvas><p>Selected bit-plane</p></div>
      </div>
    </div>
  `;

  let sourceImageData = null;
  let currentChannel = 0;
  let currentBit = 0;

  const fileInput = container.querySelector("#bp-file-input");
  const dropZone = container.querySelector("#drop-zone");
  const workspace = container.querySelector("#bp-workspace");
  const sourceCanvas = container.querySelector("#bp-source-canvas");
  const planeCanvas = container.querySelector("#bp-plane-canvas");
  const channelSelect = container.querySelector("#bp-channel-select");
  const bitSlider = container.querySelector("#bp-bit-slider");
  const bitLabel = container.querySelector("#bp-bit-label");

  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => { if (e.target.files[0]) loadImage(e.target.files[0]); });
  dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) loadImage(file);
  });

  function loadImage(file) {
    const img = new Image();
    img.onload = () => {
      const maxDim = 420;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        const scale = maxDim / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      sourceCanvas.width = w; sourceCanvas.height = h;
      planeCanvas.width = w; planeCanvas.height = h;
      const ctx = sourceCanvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      sourceImageData = ctx.getImageData(0, 0, w, h);
      workspace.style.display = "block";
      render();
    };
    img.src = URL.createObjectURL(file);
  }

  function render() {
    if (!sourceImageData) return;
    const { width, height, data } = sourceImageData;
    const out = planeCanvas.getContext("2d").createImageData(width, height);
    const mask = 1 << currentBit;
    for (let i = 0; i < data.length; i += 4) {
      const v = (data[i + currentChannel] & mask) !== 0 ? 255 : 0;
      out.data[i] = v; out.data[i + 1] = v; out.data[i + 2] = v; out.data[i + 3] = 255;
    }
    planeCanvas.getContext("2d").putImageData(out, 0, 0);
    bitLabel.textContent = currentBit === 0
      ? "Bit 0 (Least Significant) -- this is the one LSB steganography changes"
      : currentBit === 7 ? "Bit 7 (Most Significant) -- changing this would be very visible"
      : `Bit ${currentBit}`;
  }

  channelSelect.addEventListener("change", (e) => { currentChannel = parseInt(e.target.value, 10); render(); });
  bitSlider.addEventListener("input", (e) => { currentBit = parseInt(e.target.value, 10); render(); });
}
