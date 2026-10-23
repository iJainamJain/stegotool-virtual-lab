/** Cryptography / Basic simulation: live SHA-256 hashing via the real Web Crypto API. */
function mountSimulation_hashdemo(container) {
  container.innerHTML = `
    <p class="sim-hint">Type anything below. This computes a real SHA-256 hash, live, using
      your browser's own Web Crypto API -- the same algorithm StegoTool Pro's Hash
      Calculator uses.</p>
    <textarea id="hash-input" rows="4" style="width:100%; font-family: monospace;"
      placeholder="Type something..."></textarea>
    <div class="note" style="margin-top: 12px; word-break: break-all;">
      <strong>SHA-256:</strong> <span id="hash-output">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
    </div>
    <p class="sim-hint" style="margin-top: 12px;">
      Try changing just one character and watch the hash change completely -- that's
      the "avalanche effect," and it's exactly why hashing can catch even a single
      altered byte in a file.
    </p>
  `;

  const input = container.querySelector("#hash-input");
  const output = container.querySelector("#hash-output");

  async function updateHash() {
    const data = new TextEncoder().encode(input.value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    output.textContent = hex;
  }

  input.addEventListener("input", updateHash);
}
