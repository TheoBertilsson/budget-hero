"use client";
import { auth } from "@/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) return router.push("/dashboard");
      setLoading(false);
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
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center bg-[#ffffff13] p-10 rounded-lg">
        <h1>Budget Hero</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-[#ffffff1d] px-2 py-1 rounded-sm"
            />
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-[#ffffff1d] px-2 py-1 rounded-sm"
            />
            <button
              className="bg-[#ffffff1d] w-full rounded-sm py-1 hover:bg-[#0000002a] cursor-pointer"
              onClick={handleLogin}
            >
              Login
            </button>
            <a href="/signup">Not a member?</a>
          </>
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href=""
          target="_blank"
        >
          by Theo Bertilsson
        </a>
      </footer>
    </div>
  );
}
