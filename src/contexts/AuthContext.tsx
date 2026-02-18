import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { UserProfile } from '../types'
import { updateUserScore, claimDailyBonus } from '../services/scoreService'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOrCreateProfile = async (uid: string, email: string, displayName: string) => {
    const profileRef = doc(db, 'users', uid)
    const profileSnap = await getDoc(profileRef)

    if (profileSnap.exists()) {
      const data = profileSnap.data()
      const lastLogin = data.lastLoginDate || ''
      const today = new Date().toISOString().split('T')[0]

      if (lastLogin !== today) {
        const bonus = await claimDailyBonus(uid)
        if (bonus > 0) {
          await setDoc(profileRef, {
            ...data,
            lastLoginDate: today,
            totalPoints: (data.totalPoints || 0) + bonus,
          }, { merge: true })
        } else {
          await setDoc(profileRef, { lastLoginDate: today }, { merge: true })
        }
      }

      const updated = await getDoc(profileRef)
      setProfile({ uid, ...updated.data() } as UserProfile)
    } else {
      const newProfile: Partial<UserProfile> = {
        uid,
        email,
        displayName,
        totalPoints: 0,
        gamesPlayed: 0,
        achievements: [],
        lastLoginDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      }
      await setDoc(profileRef, newProfile)
      setProfile(newProfile as UserProfile)
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    const profileRef = doc(db, 'users', user.uid)
    const snap = await getDoc(profileRef)
    if (snap.exists()) {
      setProfile({ uid: user.uid, ...snap.data() } as UserProfile)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await fetchOrCreateProfile(
          firebaseUser.uid,
          firebaseUser.email || '',
          firebaseUser.displayName || 'Player'
        )
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (cred.user) {
      await fetchOrCreateProfile(cred.user.uid, email, displayName)
    }
  }

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
