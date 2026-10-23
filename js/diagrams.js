/**
 * Inline SVG diagrams for theory sections -- each one illustrates the
 * actual mechanism described in the text next to it (a real bit changing,
 * a real range remapping, a real histogram shape), not generic decoration.
 * Referenced by key from lessons-data.js's theory sections.
 */
const DIAGRAMS = {

  lsb: `
    <svg viewBox="0 0 480 160" class="diagram">
      <text x="240" y="24" text-anchor="middle" class="d-label">One pixel's red channel: value 214</text>
      <g transform="translate(40,40)">
        ${[1,1,0,1,0,1,1,0].map((bit, i) => `
          <rect x="${i*50}" y="0" width="42" height="42" rx="6"
            fill="${i === 7 ? 'url(#lsbGrad)' : 'var(--bg-elevated)'}"
            stroke="${i === 7 ? '#00e5c3' : 'var(--card-border)'}" stroke-width="${i === 7 ? 3 : 1}"/>
          <text x="${i*50 + 21}" y="27" text-anchor="middle" class="d-bit">${bit}</text>
        `).join("")}
      </g>
      <text x="65" y="112" text-anchor="middle" class="d-hint">MSB</text>
      <text x="415" y="112" text-anchor="middle" class="d-hint">LSB</text>
      <text x="415" y="132" text-anchor="middle" class="d-hint-strong">← changed to hide 1 bit</text>
      <text x="240" y="150" text-anchor="middle" class="d-hint">214 → 215 (a 1-in-255 shift, invisible to the eye)</text>
      <defs>
        <linearGradient id="lsbGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#00e5c3"/><stop offset="100%" stop-color="#3b82f6"/>
        </linearGradient>
      </defs>
    </svg>`,

  pvd: `
    <svg viewBox="0 0 480 180" class="diagram">
      <text x="240" y="24" text-anchor="middle" class="d-label">Two neighboring pixels, difference = 5</text>
      <circle cx="140" cy="70" r="26" fill="var(--bg-elevated)" stroke="#3b82f6" stroke-width="2"/>
      <text x="140" y="76" text-anchor="middle" class="d-bit">120</text>
      <circle cx="240" cy="70" r="26" fill="var(--bg-elevated)" stroke="#a855f7" stroke-width="2"/>
      <text x="240" y="76" text-anchor="middle" class="d-bit">125</text>
      <line x1="166" y1="70" x2="214" y2="70" stroke="var(--text-muted)" stroke-width="2" marker-end="url(#arrow)"/>
      <text x="190" y="58" text-anchor="middle" class="d-hint">diff = 5</text>
      <g transform="translate(20,115)">
        ${[[0,7,'0-7'],[8,15,'8-15'],[16,31,'16-31']].map(([lo,hi,label], i) => `
          <rect x="${i*150}" y="0" width="140" height="34" rx="6"
            fill="${lo===0 ? 'url(#pvdGrad)' : 'var(--bg-elevated)'}"
            stroke="${lo===0 ? '#00e5c3' : 'var(--card-border)'}" stroke-width="${lo===0?2:1}"/>
          <text x="${i*150+70}" y="22" text-anchor="middle" class="d-hint">range ${label}: n=${lo===0?3:lo===8?3:4} bits</text>
        `).join("")}
      </g>
      <text x="240" y="172" text-anchor="middle" class="d-hint">diff=5 falls in the 0-7 range -- only 3 bits embeddable (small, smooth area)</text>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="var(--text-muted)"/></marker>
        <linearGradient id="pvdGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#00e5c3"/><stop offset="100%" stop-color="#3b82f6"/>
        </linearGradient>
      </defs>
    </svg>`,

  dct: `
    <svg viewBox="0 0 480 200" class="diagram">
      <text x="240" y="24" text-anchor="middle" class="d-label">An 8×8 pixel block → frequency coefficients</text>
      <g transform="translate(60,40)">
        ${Array.from({length:64}).map((_,i) => {
          const row = Math.floor(i/8), col = i%8;
          const dist = row + col;
          const opacity = Math.max(0.08, 1 - dist/13);
          const kept = dist < 4;
          return `<rect x="${col*20}" y="${row*20}" width="18" height="18" rx="2"
            fill="${kept ? '#3b82f6' : 'var(--bg-elevated)'}" opacity="${kept ? opacity : 0.4}"/>`;
        }).join("")}
      </g>
      <text x="70" y="185" class="d-hint">low frequency (kept, blue) --</text>
      <text x="330" y="185" class="d-hint">-- high frequency (discarded)</text>
      <text x="240" y="200" text-anchor="middle" class="d-hint-strong">DCT-domain hiding adjusts the surviving (blue) coefficients directly</text>
    </svg>`,

  spread: `
    <svg viewBox="0 0 480 170" class="diagram">
      <text x="240" y="24" text-anchor="middle" class="d-label">Same payload, two ways</text>
      <text x="100" y="50" text-anchor="middle" class="d-hint">Concentrated (a few big changes)</text>
      <g transform="translate(20,60)">
        ${Array.from({length:20}).map((_,i) => `
          <rect x="${i*8}" y="0" width="6" height="${i===4||i===11||i===16 ? 40 : 6}"
            fill="${i===4||i===11||i===16 ? '#f87171' : 'var(--bg-elevated)'}" />
        `).join("")}
      </g>
      <text x="380" y="50" text-anchor="middle" class="d-hint">Spread thin (many tiny changes)</text>
      <g transform="translate(260,80)">
        ${Array.from({length:20}).map((_,i) => `
          <rect x="${i*8}" y="0" width="6" height="${8 + (i%3)*2}"
            fill="#00e5c3" opacity="0.7"/>
        `).join("")}
      </g>
      <text x="240" y="150" text-anchor="middle" class="d-hint-strong">Spread thin, each change is smaller than ordinary sensor noise</text>
    </svg>`,

  chisquare: `
    <svg viewBox="0 0 480 180" class="diagram">
      <text x="240" y="22" text-anchor="middle" class="d-label">Adjacent value-pair counts, before/after LSB embedding</text>
      <text x="110" y="42" text-anchor="middle" class="d-hint">Natural image</text>
      <g transform="translate(40,55)">
        <rect x="0" y="20" width="24" height="45" fill="var(--bg-elevated)" stroke="#3b82f6"/>
        <rect x="30" y="35" width="24" height="30" fill="var(--bg-elevated)" stroke="#3b82f6"/>
        <text x="12" y="78" text-anchor="middle" class="d-hint">2i</text><text x="42" y="78" text-anchor="middle" class="d-hint">2i+1</text>
        <rect x="80" y="10" width="24" height="55" fill="var(--bg-elevated)" stroke="#3b82f6"/>
        <rect x="110" y="45" width="24" height="20" fill="var(--bg-elevated)" stroke="#3b82f6"/>
      </g>
      <text x="370" y="42" text-anchor="middle" class="d-hint">After LSB embedding</text>
      <g transform="translate(300,55)">
        <rect x="0" y="27" width="24" height="38" fill="url(#chiGrad)"/>
        <rect x="30" y="30" width="24" height="35" fill="url(#chiGrad)"/>
        <rect x="80" y="30" width="24" height="35" fill="url(#chiGrad)"/>
        <rect x="110" y="27" width="24" height="38" fill="url(#chiGrad)"/>
      </g>
      <text x="240" y="150" text-anchor="middle" class="d-hint-strong">Pairs pulled unnaturally close to equal -- exactly what the chi-square test measures</text>
      <defs><linearGradient id="chiGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs>
    </svg>`,

  pvdboundary: `
    <svg viewBox="0 0 480 170" class="diagram">
      <text x="240" y="22" text-anchor="middle" class="d-label">Pixel-difference histogram near a PVD range boundary (diff=8)</text>
      <g transform="translate(40,40)">
        <polyline points="0,80 40,60 80,45 110,15 120,75 150,50 190,35 230,20 270,10 310,20 350,35 390,50" fill="none" stroke="#3b82f6" stroke-width="3"/>
        <line x1="120" y1="0" x2="120" y2="100" stroke="#f87171" stroke-width="1.5" stroke-dasharray="4,3"/>
        <text x="120" y="-6" text-anchor="middle" class="d-hint" fill="#f87171">boundary (8)</text>
      </g>
      <text x="240" y="160" text-anchor="middle" class="d-hint-strong">A sharp discontinuity exactly at the boundary -- PVD's own fingerprint, unrelated to chi-square's</text>
    </svg>`
};
