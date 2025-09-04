/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const logger = require("firebase-functions/logger");

initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
exports.addAdminRole = onCall(async (request) => {
  // Check if the user making the request is an admin.
  if (request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Only admins can add other admins.');
  }

  // Get user and add custom claim (admin).
  try {
    const user = await getAuth().getUserByEmail(request.data.email);
    await getAuth().setCustomUserClaims(user.uid, {
      admin: true,
    });
    return { message: `Success! ${request.data.email} has been made an admin.` };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new HttpsError('internal', 'An error occurred while setting the admin role.');
  }
});
