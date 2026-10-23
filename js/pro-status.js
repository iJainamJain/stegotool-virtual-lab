/**
 * Whether Pro tier is unlocked in this browser. There's no real payment
 * processing -- the only way to unlock is a coupon code (see coupons.js),
 * meant for testing/reviewing the Pro content without a live checkout.
 * Client-side only, same as everything else here: it's a flag in
 * localStorage, not a real entitlement check, and it doesn't follow you
 * across devices/browsers.
 */
const PRO_STATUS_KEY = "stegotool_pro_unlocked_v1";

function isProUnlocked() {
  return localStorage.getItem(PRO_STATUS_KEY) === "true";
}

function setProUnlocked(couponCode) {
  localStorage.setItem(PRO_STATUS_KEY, "true");
  localStorage.setItem(PRO_STATUS_KEY + "_via", couponCode || "unknown");
}

function clearProUnlocked() {
  localStorage.removeItem(PRO_STATUS_KEY);
  localStorage.removeItem(PRO_STATUS_KEY + "_via");
}
