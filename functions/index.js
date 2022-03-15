const functions = require("firebase-functions");

const admin = require('firebase-admin');
admin.initializeApp();

exports.notifyDevicesToLowBattery = functions.https.onCall(async (data, context) => {
  // Grab the text parameter.
  const screenToken = data.token;
  const batteryLevel = data.batteryLevel;

  var deviceTokens = [];

  // Find docs in collection 'users' where their 'screens' array contains this screen token
  const usersRef = admin.firestore().collection('users');
  const snapshot = await usersRef.where('screens', 'array-contains', screenToken).get();
  if (snapshot.empty) {
    functions.logger.log("no matching docs");
    return;
  }

  // Concatenate the user's devices FCMTokens
  snapshot.forEach(doc => {
    functions.logger.log("The doc's id");
    functions.logger.log(doc.id);
    functions.logger.log("The doc's data:");
    functions.logger.log(doc.data().FCMTokens);
    deviceTokens = deviceTokens.concat(doc.data()['FCMTokens']);
  });

  functions.logger.log("The device tokens to message:", deviceTokens);

  const screensRef = admin.firestore().collection('screens');
  const screensSnapshot = await screensRef.doc(screenToken).get();
  if (screensSnapshot.empty) {
    functions.logger.log("no matching docs for this screen");
    return;
  }
  const screenName = screensSnapshot.data()["name"];

  // Build the payload to send
  const payload = {
    "notification": {
      "title": "Low Battery for screen: " + screenName,
      "body": "Remaining battery percentage is " + batteryLevel,
    },
    "tokens": deviceTokens,
  };

  // Send message to all the devices
  admin.messaging().sendMulticast(payload)
    .then((response) => {
      console.log(response.successCount + ' messages were sent successfully');
    });

  return `Successfully received: ${screenToken}`;
});