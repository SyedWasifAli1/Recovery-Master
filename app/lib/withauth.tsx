"use client";

import { useEffect, useState, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase-config"; // اپنی فائل کے مطابق امپورٹ ایڈجسٹ کریں

export default function withAuth<T extends object>(Component: ComponentType<T>) {
  return function ProtectedRoute(props: T) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) {
          router.push("/"); // یوزر لاگ ان نہ ہو تو ہوم پیج پر بھیجو
        } else {
          setUser(currentUser);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) return <p>Loading...</p>; // جب تک لاگ ان اسٹیٹ چیک ہو رہی ہے، لوڈنگ دکھائیں

    return user ? <Component {...props} /> : null;
  };
}
