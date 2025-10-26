const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = "admin@furs.app.com"

async function main (){
  try{
    //Write to Firestore
    const db = admin.firestore();
    const docRef = db.collection("restricted_access").doc("secret_document");
    await docRef.set({ verified: true });
    console.log("Document written successfully.");

  //Verify Admin Emaill
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, {emailVerified:true})
    console.log("Admin marked as verified.");
  } catch(error){
    console.log(error)
  }
}

main();