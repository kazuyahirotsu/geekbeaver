const functions = require("firebase-functions");
const admin = require('firebase-admin');
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

    console.log(
      `User ${context.auth.uid} has requested to delete path ${path}`
    );

    return {
      path: path
    };
  });
