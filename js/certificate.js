/**
 * Renders a downloadable completion certificate to a canvas. Purely a fun,
 * personal completion badge -- not an accredited credential, and the copy on
 * the certificate itself says so, since a self-generated image with no
 * verification behind it shouldn't be presented as more than that.
 */
function renderCertificate(canvas, { name, lessonTitle }) {
  const ctx = canvas.getContext("2d");
  const W = 1000, H = 700;
  canvas.width = W;
  canvas.height = H;

  // Background
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0, 0, W, H);

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "rgba(0,229,195,0.10)");
  grad.addColorStop(0.5, "rgba(59,130,246,0.08)");
  grad.addColorStop(1, "rgba(168,85,247,0.10)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Border
  const borderGrad = ctx.createLinearGradient(0, 0, W, H);
  borderGrad.addColorStop(0, "#00e5c3");
  borderGrad.addColorStop(0.52, "#3b82f6");
  borderGrad.addColorStop(1, "#a855f7");
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.strokeRect(40, 40, W - 80, H - 80);

  ctx.textAlign = "center";

  ctx.fillStyle = "#9aa3c0";
  ctx.font = "16px 'Segoe UI', sans-serif";
  ctx.fillText("STEGOTOOL PRO LEARNING LAB", W / 2, 130);

  ctx.fillStyle = "#f1f4fb";
  ctx.font = "bold 42px 'Segoe UI', sans-serif";
  ctx.fillText("Certificate of Completion", W / 2, 190);

  ctx.fillStyle = "#9aa3c0";
  ctx.font = "18px 'Segoe UI', sans-serif";
  ctx.fillText("This certifies that", W / 2, 270);

  ctx.fillStyle = "#f1f4fb";
  ctx.font = "bold 36px 'Segoe UI', sans-serif";
  ctx.fillText(name || "A Learner", W / 2, 325);

  ctx.fillStyle = "#9aa3c0";
  ctx.font = "18px 'Segoe UI', sans-serif";
  ctx.fillText("has completed both Basic and Advanced levels of", W / 2, 380);

  ctx.fillStyle = "#00e5c3";
  ctx.font = "bold 32px 'Segoe UI', sans-serif";
  ctx.fillText(lessonTitle, W / 2, 430);

  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  ctx.fillStyle = "#9aa3c0";
  ctx.font = "16px 'Segoe UI', sans-serif";
  ctx.fillText(date, W / 2, 500);

  ctx.font = "13px 'Segoe UI', sans-serif";
  ctx.fillStyle = "#6b7392";
  ctx.fillText("A personal completion badge for self-paced learning -- not an accredited credential.", W / 2, H - 60);
}

function downloadCertificate(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
