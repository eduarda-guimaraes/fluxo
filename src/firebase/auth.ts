import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  type ActionCodeSettings,
} from "firebase/auth";
import { firebaseApp } from "./config";

export const auth = getAuth(firebaseApp);

const googleProvider = new GoogleAuthProvider();

export function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function registerWithEmail(email: string, password: string, name: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  await sendEmailVerification(credential.user);
  return credential;
}

export function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function updateUserName(name: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Nenhum usuário logado.");
  return updateProfile(user, { displayName: name });
}

export function deleteUserAccount() {
  const user = auth.currentUser;
  if (!user) throw new Error("Nenhum usuário logado.");
  return deleteUser(user);
}

export function resendVerificationEmail() {
  const user = auth.currentUser;
  if (!user) throw new Error("Nenhum usuário logado.");
  return sendEmailVerification(user);
}

export function resetPassword(email: string, actionCodeSettings?: ActionCodeSettings) {
  return sendPasswordResetEmail(auth, email, actionCodeSettings);
}

export function logout() {
  return signOut(auth);
}
