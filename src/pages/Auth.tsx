import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Auth = ({ mode }: { mode: "login" | "signup" }) => {
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const redirectUrl = `${window.location.origin}/app`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl, data: { full_name: name } },
        });
        if (error) throw error;
        toast({ title: "Account created", description: "You're signed in." });
        navigate("/app");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/app");
      }
    } catch (err: any) {
      toast({ title: "Authentication error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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

        <div className="mt-8 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground">
          <Mail className="h-4 w-4" /> Email & password
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4 flex-1">
          {isSignup && (
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Ama Boateng" className="mt-1.5 h-12 rounded-2xl" />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5 h-12 rounded-2xl" />
          </div>
          <div>
            <Label htmlFor="pwd">{isSignup ? "Create password" : "Password"}</Label>
            <Input id="pwd" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder={isSignup ? "At least 8 characters" : "••••••••"} className="mt-1.5 h-12 rounded-2xl" />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 mt-6 rounded-2xl bg-gradient-warm shadow-warm text-base">
            {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
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
