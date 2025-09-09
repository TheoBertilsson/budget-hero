"use client";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) return router.push("/dashboard");
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignup = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: username,
        createdAt: serverTimestamp(),
      });
      useRouter().push("/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-[url(../static/budgetHero.png)] bg-cover">
      <main className="flex flex-col gap-[32px] row-start-2 items-center bg-background  p-10 rounded-lg">
        <h1 className="text-text-primary text-2xl font-bold">Budget Hero</h1>

        <>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="bg-foreground/20 text-text-primary px-2 py-1 rounded-sm"
          />
          <input
            type="username"
            name="username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="bg-foreground/20 text-text-primary px-2 py-1 rounded-sm"
          />
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-foreground/20 text-text-primary px-2 py-1 rounded-sm"
          />
          <button
            className="bg-victory-green text-text-secondary font-semibold w-full rounded-sm p-1 text-lg hover:bg-victory-green/80 active:bg-victory-green/75 cursor-pointer"
            onClick={handleSignup}
          >
            Sign up
          </button>
          <a
            href="/"
            className="hover:underline hover:underline-offset-4 cursor-pointer"
          >
            Already a member?
          </a>
        </>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-text-secondary"
          href=""
          target="_blank"
        >
          by Theo Bertilsson
        </a>
      </footer>
    </div>
  );
}
