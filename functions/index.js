const functions = require("firebase-functions");

const admin = require('firebase-admin');
admin.initializeApp();

exports.notifyDevicesToLowBattery = functions.https.onCall(async (data, context) => {
  // Grab the parameters
  const screenToken = data.token;
  const batteryLevel = data.batteryLevel;

  // Build the payload to send
  const screenName = await getScreenName(screenToken);
  const payload = {
    "notification": {
      "title": "Low Battery for screen: " + screenName,
      "body": "Remaining battery percentage is " + batteryLevel,
    },
  };

  // Send message to all the devices
  await notifyDevices(screenToken, payload)

  return `Successfully received: ${screenToken}`;
});

exports.getUsersEmail = functions.https.onCall(async (data, context) => {
  const userID = data.userID;
  const user = await admin.auth().getUser(userID);
  return user.email;
});

exports.onIsOnlineChanged = functions.database.ref('/status/{screenToken}').onUpdate(
  async (change, context) => {
    const after = change.after.val();
    const isOnline = (after.isOnline === "true");
    const screenToken = context.params.screenToken;

    const screenInfoFirestoreRef = admin.firestore().collection('screenInfo').doc(screenToken);
    await screenInfoFirestoreRef.update({ isOnline: isOnline });

    // Build the payload to send
    const screenName = await getScreenName(screenToken);
    const payload = {
      "notification": {
        "title": isOnline ? ("Screen online: " + screenName) : ("Screen offline: " + screenName),
        "body": isOnline ? ("The screen has reconnected.") : ("The screen has disconnected."),
      },
    };

    // Send message to all the devices
    await notifyDevices(screenToken, payload);
  }
);

async function getScreenName(screenToken) {
  const screensRef = admin.firestore().collection('screens');
  const screensSnapshot = await screensRef.doc(screenToken).get();

  if (screensSnapshot.empty) {
    functions.logger.log("no matching docs for this screen");
    return;
  }

  return screensSnapshot.data()["name"];
}

async function notifyDevices(screenToken, payload) {
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
  payload = Object.assign(payload, { "tokens": deviceTokens });

  // Send message to all the devices
  admin.messaging().sendMulticast(payload)
    .then((response) => {
      console.log(response.successCount + ' messages were sent successfully');
    });
}

// Manually set device online status
exports.notifyDevicesToOnlineStatus = functions.https.onCall(async (data, context) => {
  // Grab the parameters
  const screenToken = data.token;
  const isOnline = (data.isOnline === "true");
  const message = data.message;
  functions.logger.log("isOnline? " + isOnline);

  // Set isOnline for this screen
  const screenInfoRef = admin.firestore().collection('screenInfo');
  await screenInfoRef.doc(screenToken).update({ isOnline: isOnline });

  // Build the payload to send
  const screenName = await getScreenName(screenToken);
  const payload = {
    "notification": {
      "title": isOnline ? ("Screen online: " + screenName) : ("Screen offline: " + screenName),
      "body": isOnline ? ("The screen has turned back online. " + message) : ("The screen has turned offline. " + message),
    },
  };

  // Send message to all the devices
  await notifyDevices(screenToken, payload);

  return `Successfully received: ${screenToken}`;
});
