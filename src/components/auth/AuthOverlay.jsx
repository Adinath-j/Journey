import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export function AuthOverlay() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password).catch(() => {});
    } else {
      await register(email, password, name).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#030817]/80 p-6 backdrop-blur-md">
      <GlassCard className="w-full max-w-[400px] p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-50">{isLogin ? "Welcome back" : "Start your journey"}</h2>
        <p className="mt-2 text-sm text-slate-300">{isLogin ? "Sign in to pick up where you left off." : "Create an account to track your progress."}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
          
          {!isLogin && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300" htmlFor="name">Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50" placeholder="Software Engineer" required={!isLogin} />
            </div>
          )}
          
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300" htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50" placeholder="engineer@example.com" required />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300" htmlFor="password">Password</label>
            <div className="relative">
              <input id="password" type={showPassword ? "text" : "password"} autoComplete={isLogin ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50" placeholder="••••••••" required minLength={6} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="mt-2 w-full justify-center bg-violet-500 hover:bg-violet-600">
            {isLoading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-medium text-violet-400 hover:text-violet-300 focus:outline-none">
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
