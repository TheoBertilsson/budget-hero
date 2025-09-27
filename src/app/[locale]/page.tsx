"use client";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) return router.push("/dashboard");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (!userCred) return;
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };
  return (
    <div
      className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center h-[100dvh]
      "
    >
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Budget Hero</CardTitle>
            <CardAction>
              <Button variant={"link"}>
                <Link href="/signup">{t("auth:signup")}</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <form id="loginForm" onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
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
                  <div className="flex items-center">
                    <Label htmlFor="password">{t("auth:password")}</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      {t("auth:forgotPassword")}
                    </a>
                  </div>
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
              type="submit"
              form="loginForm"
              className="w-full"
              disabled={loading}
            >
              {loading ? t("auth:pleaseWait") : t("auth:login")}
            </Button>
            <Button variant="outline" className="w-full">
              {t("auth:signinGoogle")}
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-text-secondary text-sm"
          href=""
          target="_blank"
        >
          {t("auth:byTheoBertilsson")}
        </a>
      </footer>
    </div>
  );
}
