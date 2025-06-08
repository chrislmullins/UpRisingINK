// [v1] This file is up to date with the GitHub v1 branch migration to Firebase Auth/Firestore.

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "@/firebase"; // <-- import your initialized Firebase SDK here
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

// Firebase config for reference
const firebaseConfig = {
  apiKey: "AIzaSyAD3yZA7ymXo5RyaXCIF3MASCEDF8KxqmM",
  authDomain: "uprisinginkapp.firebaseapp.com",
  projectId: "uprisinginkapp",
  storageBucket: "uprisinginkapp.firebasestorage.app",
  messagingSenderId: "214379695954",
  appId: "1:214379695954:web:d1d87c91d9a9d5bd4af48b"
};

export type UserRole = "client" | "artist" | "manager" | "owner";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Utility: Fetch user profile from Firestore
  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<AuthUser | null> => {
    const userRef = doc(db, "profiles", firebaseUser.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const profile = docSnap.data() as UserProfile;
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email || profile.email,
        role: profile.role,
        profile
      };
    } else {
      // No profile found, you might want to create one or set user as null
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authUser = await fetchUserProfile(firebaseUser);
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // SIGN IN
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  // SIGN UP
  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: UserRole = "client"
  ) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      // Create Firestore profile doc
      const userProfile: UserProfile = {
        id: firebaseUser.uid,
        email: email,
        full_name: fullName,
        role,
        profile_image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await setDoc(doc(db, "profiles", firebaseUser.uid), userProfile);
      setLoading(false);
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  // SIGN OUT
  const signOut = async () => {
    setLoading(true);
    await firebaseSignOut(auth);
    setUser(null);
    setLoading(false);
  };

  // UPDATE PROFILE
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) return { error: "No user logged in" };
      const userRef = doc(db, "profiles", user.id);
      await updateDoc(userRef, {
        ...updates,
        updated_at: new Date().toISOString()
      });
      // Fetch updated profile
      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        const updatedProfile = updatedDoc.data() as UserProfile;
        setUser({
          ...user,
          profile: updatedProfile,
          role: updatedProfile.role
        });
        return { error: null };
      } else {
        return { error: "Profile not found after update" };
      }
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
