import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, Mail } from "lucide-react";

const Auth = ({ mode }: { mode: "login" | "signup" }) => {
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen flex flex-col px-6 pt-6 pb-8">
        <Link to="/" className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="mt-6">
          <h1 className="font-display font-semibold text-3xl text-balance">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isSignup ? "Join thousands of savers building wealth together." : "Sign in to your SusuCircle."}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2 p-1 bg-muted rounded-2xl">
          {[
            { id: "phone" as const, label: "Phone", icon: Phone },
            { id: "email" as const, label: "Email", icon: Mail },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setMethod(id)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ease-soft ${
                method === id ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
              }`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); navigate(isSignup ? "/verify" : "/app"); }} className="mt-6 space-y-4 flex-1">
          {isSignup && (
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required placeholder="Ama Boateng" className="mt-1.5 h-12 rounded-2xl" />
            </div>
          )}
          {method === "phone" ? (
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-12 px-4 rounded-2xl border border-input bg-card flex items-center font-medium text-sm">🇬🇭 +233</div>
                <Input id="phone" type="tel" required placeholder="24 555 0142" className="h-12 rounded-2xl flex-1" />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" required placeholder="you@example.com" className="mt-1.5 h-12 rounded-2xl" />
            </div>
          )}
          {!isSignup && (
            <div>
              <Label htmlFor="pwd">Password</Label>
              <Input id="pwd" type="password" required placeholder="••••••••" className="mt-1.5 h-12 rounded-2xl" />
            </div>
          )}
          {isSignup && (
            <div>
              <Label htmlFor="pwd">Create password</Label>
              <Input id="pwd" type="password" required placeholder="At least 8 characters" className="mt-1.5 h-12 rounded-2xl" />
            </div>
          )}

          <Button type="submit" className="w-full h-14 mt-6 rounded-2xl bg-gradient-warm shadow-warm text-base">
            {isSignup ? "Send verification code" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignup ? "Already have an account? " : "New to SusuCircle? "}
          <Link to={isSignup ? "/login" : "/signup"} className="text-primary font-semibold">
            {isSignup ? "Sign in" : "Create one"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Auth;
