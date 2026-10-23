/**
 * Coupon codes are checked entirely client-side against this hardcoded list
 * -- there's no server, so this is not how a real store would do it (a real
 * implementation validates server-side, since a client-side list can be read
 * by anyone with dev tools open). This is fine here because nothing real is
 * actually for sale yet; a real launch needs real server-side validation.
 *
 * Codes avoid ambiguous characters (O/0, I/1) per standard coupon-UX
 * guidance.
 */
const COUPONS = {
  "TESTFREE100": { percentOff: 100, label: "Testing access -- 100% off" },
  "WELCOME20": { percentOff: 20, label: "Welcome offer -- 20% off" },
  "EARLYBIRD50": { percentOff: 50, label: "Early access -- 50% off" }
};

function lookupCoupon(code) {
  const normalized = (code || "").trim().toUpperCase();
  return COUPONS[normalized] || null;
}

function applyCoupon(code) {
  const coupon = lookupCoupon(code);
  if (!coupon) return { ok: false, message: "That code isn't valid or has expired." };

  if (coupon.percentOff >= 100) {
    setProUnlocked(code.trim().toUpperCase());
    return { ok: true, fullyUnlocked: true, coupon, message: `Applied: ${coupon.label}. Pro tier is unlocked in this browser.` };
  }

  return {
    ok: true,
    fullyUnlocked: false,
    coupon,
    message: `Applied: ${coupon.label}. Checkout isn't live yet, so this can't actually be charged -- ` +
      `a 100%-off code is the only one that unlocks anything right now.`
  };
}
