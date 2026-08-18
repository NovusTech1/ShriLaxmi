import 'server-only';

const textEncoder = new TextEncoder();

// Helper to convert binary signatures to a storable base64 string
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function getCryptoKey() {
  const secret = process.env.SESSION_SECRET || "fallback_secret";
  return await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionCookieValue() {
  const key = await getCryptoKey();
  const data = textEncoder.encode("admin_authenticated");
  const signature = await crypto.subtle.sign("HMAC", key, data);
  return "admin." + arrayBufferToBase64(signature);
}

export async function verifySessionCookie(cookieValue) {
  if (!cookieValue || !cookieValue.startsWith("admin.")) return false;
  
  try {
    // Since our secret and data string are static, a valid session 
    // will perfectly match a freshly generated signature.
    const expectedValue = await createSessionCookieValue();
    return cookieValue === expectedValue;
  } catch (e) {
    return false;
  }
}