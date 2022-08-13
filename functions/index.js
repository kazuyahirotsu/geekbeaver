const functions = require("firebase-functions");
const admin = require('firebase-admin');
const firebase_tools = require('firebase-tools');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const app = admin.initializeApp();
const db = admin.firestore();

exports.recursiveDelete = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 540,
    memory: '2GB'
  })
  .https.onCall(async (data, context) => {

    const path = data.path;
    const docRef = db.doc(path);
    await db.recursiveDelete(docRef);

    // // Only allow admin users to execute this function.
    // if (!(context.auth)) {
    //   throw new functions.https.HttpsError(
    //     'permission-denied',
    //     'Must be an administrative user to initiate delete.'
    //   );
    // }

    // const path = data.path;
    console.log(
      `User ${context.auth.uid} has requested to delete path ${path}`
    );

    // // Run a recursive delete on the given document or collection path.
    // // The 'token' must be set in the functions config, and can be generated
    // // at the command line by running 'firebase login:ci'.
    // await firebase_tools.firestore
    //   .delete(path, {
    //     project: process.env.GCLOUD_PROJECT,
    //     recursive: true,
    //     yes: true,
    //     token: functions.config().fb.token
    //   });



    return {
      path: path
    };
  });
