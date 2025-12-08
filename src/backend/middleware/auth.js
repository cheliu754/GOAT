const admin = require("../config/firebase.js");

/**
 * Verify Firebase ID token and attach decoded user info to req.user.
 * Accepts tokens from the Authorization header (Bearer) or idToken field.
 */
async function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  const idToken =
    bearerToken ||
    req.headers["x-id-token"] ||
    req.body?.idToken ||
    req.query?.idToken;

  if (!idToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: missing ID token",
    });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
    };
    return next();
  } catch (err) {
    console.error("Auth verify error:", err);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: invalid or expired token",
    });
  }
}

module.exports = auth;
