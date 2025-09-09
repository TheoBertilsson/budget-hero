"use client";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) return router.push("/dashboard");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (!userCred) return;
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-[url(../static/budgetHero.png)] bg-cover bg-foreground">
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
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-foreground/20 text-text-primary px-2 py-1 rounded-sm"
          />
          <button
            className="bg-[#10B981] text-text-secondary font-semibold w-full rounded-sm p-1 text-lg hover:bg-victory-green/80 active:bg-victory-green/75 cursor-pointer"
            onClick={handleLogin}
          >
            Login
          </button>
          <a
            href="/signup"
            className="hover:underline hover:underline-offset-4 cursor-pointer"
          >
            Not a member?
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
