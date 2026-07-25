import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from './config';

export const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    return { user: null, error: error.message || 'Failed to sign in with Google' };
  }
};

export const emailSignUp = async (email: string, pass: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      await updateProfile(result.user, { displayName: name });
    }
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Email Sign-Up Error:', error);
    return { user: null, error: error.message || 'Failed to create account' };
  }
};

export const emailSignIn = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error('Email Sign-In Error:', error);
    return { user: null, error: error.message || 'Invalid email or password' };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error: error.message || 'Failed to send password reset email' };
  }
};

export const logOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message || 'Failed to log out' };
  }
};
