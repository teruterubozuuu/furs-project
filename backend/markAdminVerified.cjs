const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = "admin@furs.app.com"

async function verifyAdminEmail(){
    try{
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().updateUser(user.uid, {emailVerified:true})
        console.log("Admin marked as verified.");
    } catch (error){
        console.error("Error verifying email", error)
    }
}

verifyAdminEmail();