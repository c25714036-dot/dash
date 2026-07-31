const { initializeApp, applicationDefault } = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const firebaseConfig = require('../firebase-applet-config.json');

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: applicationDefault(),
  projectId: firebaseConfig.projectId
});

const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const email = "carlos5236cruz@gmail.com";
  const password = "Proview@2701";

  try {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`User already exists in Firebase Auth with UID: ${userRecord.uid}`);
      
      // Update password just in case
      await auth.updateUser(userRecord.uid, { password });
      console.log("User password updated.");
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email,
          password,
        });
        console.log(`User created successfully via Admin SDK with UID: ${userRecord.uid}`);
      } else {
        throw err;
      }
    }

    // Set custom claims (role)
    await auth.setCustomUserClaims(userRecord.uid, { role: "superAdmin" });
    console.log("Custom claims 'role: superAdmin' successfully assigned.");

    // Save/update user record in firestore database
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      role: "superAdmin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log("User record created/updated in Firestore database.");

    console.log("\n🎉 Process completed successfully! The user is ready to login.");
  } catch (error) {
    console.error("❌ Error running script:", error.message || error);
  }
}

run();
