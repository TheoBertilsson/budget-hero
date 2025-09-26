"use client";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export default function SignupPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) return router.push("/dashboard");
    });
    return () => unsubscribe();
  }, [router]);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const username = formData.get("username");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    setLoading(true);
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
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-[url(../../static/budgetHero.png)] bg-cover">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Budget Hero</CardTitle>
            <CardDescription>{t("auth:signupAdventure")}</CardDescription>
            <CardAction>
              <Button variant={"link"}>
                <Link href="/">{t("auth:login")}</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} id="signupForm">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">{t("auth:username")}</Label>
                  <Input id="username" name="username" type="text" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t("auth:password")}</Label>

                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              form="signupForm"
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? t("auth:pleaseWait") : t("auth:signup")}
            </Button>
            <Button variant="outline" className="w-full">
              {t("auth:signinGoogle")}
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-text-secondary"
          href=""
          target="_blank"
        >
          {t("auth:byTheoBertilsson")}
        </a>
      </footer>
    </div>
  );
}
