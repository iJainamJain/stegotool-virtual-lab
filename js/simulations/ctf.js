/**
 * Steganography / Advanced simulation: a real flag, genuinely hidden with
 * LSB in a bundled cover image (assets/ctf-cover.png) -- a 16-bit length
 * header followed by the flag's bytes, one bit per pixel's red channel,
 * MSB-first. This decoder reads the real embedded bits; nothing is faked.
 */
function mountSimulation_ctf(container) {
  container.innerHTML = `
    <p class="sim-hint">
      This image has a real flag hidden in it with LSB -- the same technique from
      the Basic level, for real this time. Inspect its bit-0 plane if you want a
      hint, or just decode it directly below.
    </p>
    <div class="canvas-row">
      <div class="canvas-col"><img id="ctf-image" src="assets/ctf-cover.png" style="max-width:100%; border-radius: var(--radius-sm); border: 1px solid var(--card-border);"></div>
    </div>
    <button id="ctf-decode-btn" class="btn btn-primary" style="margin-top: 16px;">Decode Hidden Flag</button>
    <div id="ctf-result" class="note" style="margin-top: 12px; display:none;"></div>
  `;

  const img = container.querySelector("#ctf-image");
  const decodeBtn = container.querySelector("#ctf-decode-btn");
  const resultBox = container.querySelector("#ctf-result");

  decodeBtn.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const { data, width } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    function getBit(i) {
      const x = i % width;
      const y = Math.floor(i / width);
      const p = (y * width + x) * 4;
      return data[p] & 1; // red channel LSB
    }

    let length = 0;
    for (let i = 0; i < 16; i++) length = (length << 1) | getBit(i);

    const bytes = [];
    for (let b = 0; b < length; b++) {
      let byte = 0;
      for (let i = 0; i < 8; i++) {
        byte = (byte << 1) | getBit(16 + b * 8 + i);
      }
      bytes.push(byte);
    }

    const flag = String.fromCharCode(...bytes);
    resultBox.textContent = `Decoded flag: ${flag}`;
    resultBox.style.display = "block";
  });
}
