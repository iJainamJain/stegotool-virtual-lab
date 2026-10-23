/**
 * Faithful JS port of engine/.../steganalysis/Steganalysis.kt (chi-square
 * attack + PVD boundary-artifact score) -- same algorithm, same constants,
 * same edge-case handling as the real app. Runs entirely client-side on an
 * image you provide; nothing is uploaded anywhere.
 */

// ── Regularized lower incomplete gamma function P(a, x) ──────────────────
const LANCZOS_G = 7;
const LANCZOS_COEFFICIENTS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
];

function logGamma(xIn) {
  if (xIn < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * xIn)) - logGamma(1 - xIn);
  }
  const x = xIn - 1;
  let a = LANCZOS_COEFFICIENTS[0];
  const t = x + LANCZOS_G + 0.5;
  for (let i = 1; i <= LANCZOS_G + 1; i++) {
    a += LANCZOS_COEFFICIENTS[i] / (x + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function gammaSeries(a, x) {
  if (x <= 0.0) return 0.0;
  let ap = a;
  let total = 1.0 / a;
  let delta = total;
  for (let i = 0; i < 500; i++) {
    ap += 1;
    delta *= x / ap;
    total += delta;
    if (Math.abs(delta) < Math.abs(total) * 1e-14) break;
  }
  return total * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

function gammaContinuedFraction(a, x) {
  const tiny = 1e-300;
  let b = x + 1.0 - a;
  let c = 1.0 / tiny;
  let d = 1.0 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2.0;
    d = an * d + b;
    if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1.0 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1.0) < 1e-14) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
}

function regularizedLowerIncompleteGamma(a, x) {
  if (a <= 0) throw new Error("a must be positive");
  if (x < 0) throw new Error("x must be non-negative");
  if (x === 0.0) return 0.0;
  return x < a + 1.0 ? gammaSeries(a, x) : 1.0 - gammaContinuedFraction(a, x);
}

// ── Chi-square attack (LSB replacement) ───────────────────────────────────

/** values: flattened 8-bit sample array (0-255). Returns {statistic, degreesOfFreedom, probabilityOfEmbedding, pairsUsed}. */
function chiSquareAttack(values) {
  if (values.length === 0) throw new Error("no sample values to analyze");

  const histogram = new Float64Array(256);
  for (const v of values) {
    if (v >= 0 && v <= 255) histogram[v] += 1.0;
  }

  let chi2 = 0.0;
  let pairsUsed = 0;
  for (let i = 0; i < 128; i++) {
    const nI = histogram[2 * i] + histogram[2 * i + 1];
    if (nI <= 0.0) continue;
    const expected = nI / 2.0;
    chi2 += (histogram[2 * i] - expected) * (histogram[2 * i] - expected) / expected;
    pairsUsed++;
  }

  const dof = pairsUsed - 1;
  if (dof < 1) {
    return { statistic: 0.0, degreesOfFreedom: 0, probabilityOfEmbedding: 0.0, pairsUsed };
  }

  const probability = 1.0 - regularizedLowerIncompleteGamma(dof / 2.0, chi2 / 2.0);
  return { statistic: chi2, degreesOfFreedom: dof, probabilityOfEmbedding: probability, pairsUsed };
}

// ── PVD boundary-artifact score ───────────────────────────────────────────

const PVD_RANGE_STARTS = [0, 8, 16, 32, 64, 128]; // matches ImagePVD.PVD_RANGES

function differenceHistogram(gray, width, height) {
  const usableWidth = width - (width % 2);
  if (usableWidth < 2 || height < 1) throw new Error("image too small for pair analysis");

  const histogram = new Float64Array(256);
  let pairs = 0;
  for (let r = 0; r < height; r++) {
    let c = 0;
    while (c < usableWidth) {
      const p1 = gray[r * width + c];
      const p2 = gray[r * width + c + 1];
      const diff = Math.abs(p1 - p2);
      if (diff >= 0 && diff <= 255) histogram[diff] += 1.0;
      pairs++;
      c += 2;
    }
  }
  return { histogram, pairs };
}

function localCurvature(histogram, position) {
  if (position <= 0 || position >= 255) return 0.0;
  return Math.abs(histogram[position + 1] - 2 * histogram[position] + histogram[position - 1]);
}

/** gray: flattened grayscale pixels (0-255), row-major, length == width*height. */
function pvdBoundaryArtifactScore(gray, width, height) {
  const { histogram, pairs } = differenceHistogram(gray, width, height);

  const boundaries = PVD_RANGE_STARTS.slice(1); // interior boundaries: 8, 16, 32, 64, 128
  const controls = boundaries.map((b) => b + 3);

  const boundaryScore = boundaries.reduce((sum, b) => sum + localCurvature(histogram, b), 0) / boundaries.length;
  const controlScore = controls.reduce((sum, c) => sum + localCurvature(histogram, c), 0) / controls.length;

  let ratio;
  if (controlScore > 0.0) ratio = boundaryScore / controlScore;
  else if (boundaryScore > 0.0) ratio = Infinity;
  else ratio = 1.0;

  return { boundaryScore, controlScore, ratio, pairsAnalyzed: pairs };
}

/** Converts an ImageData (from a canvas) to a flattened grayscale IntArray via luminance. */
function toGrayscale(imageData) {
  const { data, width, height } = imageData;
  const gray = new Int32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  return { gray, width, height };
}

/**
 * Flattens an ImageData's R,G,B bytes together (alpha dropped), interleaved
 * per pixel -- matches the reference engine's chi_square_attack_image, which
 * runs the test over every channel's bytes combined, not just one channel.
 */
function allRgbBytes(imageData) {
  const { data } = imageData;
  const out = new Int32Array((data.length / 4) * 3);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 3) {
    out[p] = data[i];
    out[p + 1] = data[i + 1];
    out[p + 2] = data[i + 2];
  }
  return out;
}
