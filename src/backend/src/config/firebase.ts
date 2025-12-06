import admin from "firebase-admin";

const base64Key = process.env.FIREBASE_ADMIN_KEY_BASE64;

if (!base64Key) {
    throw new Error("FIREBASE_ADMIN_KEY_BASE64 is not set");
}

const serviceAccountJSON = Buffer.from(base64Key, "base64")
                                 .toString();

const serviceAccount = JSON.parse(serviceAccountJSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});