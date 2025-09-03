import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Sign up
  const signup = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create one
      const existingProfile = await getUserProfile(result.user.uid);
      if (!existingProfile) {
        await createUserProfile(result.user.uid, {
          displayName: result.user.displayName || 'User',
          avatar: { src: result.user.photoURL, name: 'Google Profile' },
          preferences: {
            language: 'EN',
            autoPlay: true,
            autoNext: true
          }
        });
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = () => {
    return signOut(auth);
  };

  // Create user profile
  const createUserProfile = async (userId, profileData) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Update display name in auth
      if (profileData.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName
        });
      }
      
      setUserProfile(profileData);
      return true;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        setUserProfile(profile);
        return profile;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  // Update user profile
  const updateUserProfile = async (userId, updates) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
      
      setUserProfile(prev => ({ ...prev, ...updates }));
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Get user profile from Firestore
        await getUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    signInWithGoogle,
    logout,
    createUserProfile,
    getUserProfile,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
