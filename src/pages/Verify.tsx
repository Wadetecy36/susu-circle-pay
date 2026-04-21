import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Verify = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handle = (i: number, v: string) => {
    const digit = v.slice(-1).replace(/\D/g, "");
    const next = [...code]; next[i] = digit; setCode(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d)) setTimeout(() => navigate("/app"), 250);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen flex flex-col px-6 pt-6 pb-8">
        <Link to="/signup" className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="mt-6">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-medium mb-3">
            Verify your number
          </div>
          <h1 className="font-display font-semibold text-3xl">Enter the 6-digit code</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            We sent it to <span className="font-medium text-foreground">+233 24 555 0142</span>
          </p>
        </div>

        <div className="mt-10 grid grid-cols-6 gap-2">
          {code.map((d, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              value={d}
              onChange={e => handle(i, e.target.value)}
              onKeyDown={e => { if (e.key === "Backspace" && !d && i > 0) refs.current[i-1]?.focus(); }}
              inputMode="numeric"
              maxLength={1}
              className="aspect-square text-center text-2xl font-display font-semibold rounded-2xl border-2 border-input bg-card focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all"
            />
          ))}
        </div>

        <div className="mt-6 text-center">
          <button className="text-sm text-muted-foreground">
            Didn't get it? <span className="text-primary font-semibold">Resend in 32s</span>
          </button>
        </div>

        <div className="flex-1" />

        <Button onClick={() => navigate("/app")} className="w-full h-14 rounded-2xl bg-gradient-warm shadow-warm text-base">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default Verify;
