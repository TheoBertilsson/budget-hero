"use client";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

      console.log("User signed up and Firestore profile created:", user.uid);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center bg-[#ffffff13] p-10 rounded-lg">
        <h1>Budget Hero</h1>
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
          type="username"
          name="username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
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
          onClick={handleSignup}
        >
          Sign up
        </button>
        <a href="/">Already a member?</a>
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
