const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Callable function to set a user's role (e.g., 'artist', 'client')
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Only allow admins to set roles
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Only admins can set user roles.");
  }

  const {uid, role} = data;
  if (!uid || !role) {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with uid and role.");
  }

  // Set custom claim
  await admin.auth().setCustomUserClaims(uid, {role});
  return {success: true};
});
