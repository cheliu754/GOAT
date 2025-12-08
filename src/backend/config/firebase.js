const admin = require("firebase-admin");

// Initialize Firebase Admin SDK once per process.
if (!admin.apps.length) {
  const base64Key = process.env.FIREBASE_ADMIN_KEY_BASE64;

  if (!base64Key) {
    throw new Error("FIREBASE_ADMIN_KEY_BASE64 is not set");
  }

  let serviceAccount;
  try {
    const serviceAccountJSON = Buffer.from(base64Key, "base64").toString();
    serviceAccount = JSON.parse(serviceAccountJSON);
  } catch (err) {
    throw new Error("Failed to parse FIREBASE_ADMIN_KEY_BASE64 env as JSON");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
