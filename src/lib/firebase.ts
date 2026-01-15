import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBTr0L5qxdrVEtWuP2oAicJXQvVyeXkMts",
    authDomain: "trello-7ea39.firebaseapp.com",
    projectId: "trello-7ea39",
    storageBucket: "trello-7ea39.firebasestorage.app",
    messagingSenderId: "321067890572",
    appId: "1:321067890572:web:e34e1e657125d37be688a9"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
export const auth = getAuth(appFirebase);
export const googleAuth = () => signInWithPopup(auth, provider).then((result) => {
    console.log('User signed in:', result.user);
    return result;
})
export const emailAuth = (username: string, password: string) => {
    return signInWithEmailAndPassword(auth, username, password)
}
export const forgotPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email)
        .then(() => {
            console.log('Password reset email sent');
        })
        .catch((error) => {
            console.error('Error sending password reset email:', error);
            throw error;
        });
}
export const signUp = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('User signed up:', userCredential.user);
            return userCredential.user;
        })
        .catch((error) => {
            console.error('Error signing up:', error);
            throw error;
        });
}