/**
 * Cryptography / Advanced simulation: a real, live PBKDF2 derivation (via
 * Web Crypto -- genuine computation, not an animation) as a hands-on example
 * of key stretching, shown alongside StegoTool Pro's *actual* real KDF
 * parameters (it uses scrypt, not PBKDF2 -- Web Crypto has no native scrypt,
 * so this demo uses PBKDF2 as a representative, interactive stand-in and is
 * explicit about that distinction rather than blurring it).
 */
function mountSimulation_kdfvisualizer(container) {
  container.innerHTML = `
    <div class="note" style="margin-bottom: 16px;">
      StegoTool Pro's real KDF is <strong>scrypt</strong> with N=16384, r=8, p=1,
      a 16-byte salt, and a 32-byte derived key -- scrypt's memory-hardness makes
      it more resistant to GPU/ASIC cracking than PBKDF2. Web Crypto (what runs
      this demo, in your browser) doesn't implement scrypt, so this hands-on part
      uses PBKDF2 -- a different but related KDF, stretching a password the same
      basic way -- as a real, live example you can actually run.
    </div>

    <label>Password: <input id="kdf-password" type="text" value="hunter2" style="width:100%; font-family: monospace;"></label>
    <div style="margin-top: 12px;">
      <label>Iterations: <span id="kdf-iter-label">100,000</span></label>
      <input id="kdf-iterations" type="range" min="1000" max="300000" step="1000" value="100000" style="width:100%;">
    </div>

    <button id="kdf-derive-btn" class="btn btn-primary" style="margin-top: 16px;">Derive Key</button>

    <div id="kdf-result" style="margin-top: 16px; display:none;">
      <div class="note" style="word-break: break-all;">
        <strong>Salt (random, generated fresh):</strong> <span id="kdf-salt"></span><br>
        <strong>Derived key (PBKDF2-SHA256):</strong> <span id="kdf-key"></span><br>
        <strong>Time taken:</strong> <span id="kdf-time"></span>
      </div>
      <p class="sim-hint" style="margin-top: 8px;">
        Try dragging the iteration slider up and re-deriving -- notice it takes
        proportionally longer. That's the entire point: the same slowdown applies
        to every guess an attacker tries.
      </p>
    </div>
  `;

  const passwordInput = container.querySelector("#kdf-password");
  const iterSlider = container.querySelector("#kdf-iterations");
  const iterLabel = container.querySelector("#kdf-iter-label");
  const deriveBtn = container.querySelector("#kdf-derive-btn");
  const resultBox = container.querySelector("#kdf-result");
  const saltEl = container.querySelector("#kdf-salt");
  const keyEl = container.querySelector("#kdf-key");
  const timeEl = container.querySelector("#kdf-time");

  iterSlider.addEventListener("input", () => {
    iterLabel.textContent = parseInt(iterSlider.value, 10).toLocaleString();
  });

  deriveBtn.addEventListener("click", async () => {
    deriveBtn.disabled = true;
    deriveBtn.textContent = "Deriving...";

    const password = passwordInput.value;
    const iterations = parseInt(iterSlider.value, 10);
    const salt = crypto.getRandomValues(new Uint8Array(16));

    const passKey = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
    );

    const start = performance.now();
    const derivedBits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      passKey,
      256
    );
    const elapsed = performance.now() - start;

    const saltHex = Array.from(salt).map((b) => b.toString(16).padStart(2, "0")).join("");
    const keyHex = Array.from(new Uint8Array(derivedBits)).map((b) => b.toString(16).padStart(2, "0")).join("");

    saltEl.textContent = saltHex;
    keyEl.textContent = keyHex;
    timeEl.textContent = `${elapsed.toFixed(1)} ms`;
    resultBox.style.display = "block";

    deriveBtn.disabled = false;
    deriveBtn.textContent = "Derive Key";
  });
}
