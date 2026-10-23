/**
 * Steganalysis / Basic simulation: a real clean image next to the same
 * image with a real payload LSB-encoded into it -- same pair used to
 * validate the app's own detectors. Side by side, they're indistinguishable
 * to the eye; toggling to bit-0 view doesn't obviously reveal it either --
 * that's the point, and why Advanced needs a statistical test, not a look.
 */
function mountSimulation_compare(container) {
  container.innerHTML = `
    <p class="sim-hint">
      One of these has a real hidden payload, one doesn't. Try to tell which by
      eye -- then flip to bit-0 view. Even that usually isn't obviously different;
      that's exactly why a statistical test (Advanced level) is needed.
    </p>
    <div class="controls">
      <label><input type="checkbox" id="compare-bitplane-toggle"> Show bit-0 plane instead</label>
    </div>
    <div class="canvas-row">
      <div class="canvas-col"><canvas id="compare-clean-canvas"></canvas><p>Image A</p></div>
      <div class="canvas-col"><canvas id="compare-stego-canvas"></canvas><p>Image B</p></div>
    </div>
    <button id="compare-reveal-btn" class="btn btn-outline" style="margin-top: 16px;">Reveal which is which</button>
    <div id="compare-result" class="note" style="margin-top: 12px; display:none;"></div>
  `;

  const toggle = container.querySelector("#compare-bitplane-toggle");
  const cleanCanvas = container.querySelector("#compare-clean-canvas");
  const stegoCanvas = container.querySelector("#compare-stego-canvas");
  const revealBtn = container.querySelector("#compare-reveal-btn");
  const resultBox = container.querySelector("#compare-result");

  let cleanImg, stegoImg;
  let loaded = 0;

  function onLoaded() {
    loaded++;
    if (loaded === 2) render();
  }

  cleanImg = new Image();
  cleanImg.onload = onLoaded;
  cleanImg.src = "assets/compare-clean.png";

  stegoImg = new Image();
  stegoImg.onload = onLoaded;
  stegoImg.src = "assets/compare-stego.png";

  function drawNormal(canvas, img) {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);
  }

  function drawBitplane(canvas, img) {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const out = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = (imgData.data[i] & 1) !== 0 ? 255 : 0;
      out.data[i] = v; out.data[i + 1] = v; out.data[i + 2] = v; out.data[i + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
  }

  function render() {
    const draw = toggle.checked ? drawBitplane : drawNormal;
    draw(cleanCanvas, cleanImg);
    draw(stegoCanvas, stegoImg);
  }

  toggle.addEventListener("change", render);

  revealBtn.addEventListener("click", () => {
    resultBox.textContent = "Image A is the clean original. Image B has a real payload hidden with LSB.";
    resultBox.style.display = "block";
  });
}
