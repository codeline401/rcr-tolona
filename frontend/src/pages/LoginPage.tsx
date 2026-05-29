import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import api from "../lib/axios";
import type { ApiResponse, AuthTokenPayload } from "../types";
import rcrLogo from "../assets/rcr-logo.png";
import rcrBg from "../assets/rcr-bg.jpg";

/**
 * Envoie les identifiants au endpoint POST /auth/login.
 * @param credentials - Email et mot de passe de l'utilisateur.
 * @returns Les données d'authentification (token + user).
 */
async function loginRequest(
  credentials: { email: string; password: string },
): Promise<AuthTokenPayload> {
  const { data } = await api.post<ApiResponse<AuthTokenPayload>>(
    "/auth/login",
    credentials,
  );
  return data.data;
}

/**
 * Page de connexion.
 * Affiche un formulaire plein écran avec photo de fond RCR.
 * Utilise TanStack Query (useMutation) pour appeler l'API de login.
 * En cas de succès, persiste l'utilisateur dans authStore et redirige.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const from =
    (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

  /** Mutation TanStack Query pour l'authentification. */
  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate(from, { replace: true });
    },
  });

  const errorMessage =
    (loginMutation.error as { response?: { data?: { message?: string } } })
      ?.response?.data?.message ?? (loginMutation.isError ? "Identifiants incorrects" : "");

  /**
   * Gestionnaire de soumission du formulaire.
   * Empêche le rechargement de la page et déclenche la mutation de login.
   */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* ── Full-bleed background image ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${rcrBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* ── Left branding panel (desktop) ── */}
      <div className="relative hidden flex-col justify-between p-12 lg:flex lg:w-[55%]">
        {/* Top logo + name */}
        <div className="flex items-center gap-4">
          <img
            src={rcrLogo}
            alt="RCR"
            className="h-14 w-14 rounded-full ring-2 ring-white/30 shadow-xl"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Espace Plateforme
            </p>
            <p className="text-lg font-bold text-white leading-tight">
              Réseau des Citoyens Responsables
            </p>
          </div>
        </div>

        {/* Centre tagline */}
        <div className="max-w-md">
          <h1 className="text-5xl font-extrabold leading-tight text-white drop-shadow-lg">
            Ensemble pour un Madagascar meilleur.
          </h1>
          <p className="mt-4 text-white/60 text-lg">
            Gérez les membres, les finances et les activités depuis un seul
            espace sécurisé.
          </p>
        </div>

        {/* Bottom trust badges */}
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <ShieldCheck size={16} />
          <span>Connexion sécurisée · RCR NTIC © 2026</span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="relative flex flex-1 items-center justify-center p-6 lg:p-12">
        {/* Glass card */}
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl lg:p-10">
          {/* Mobile logo */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <img src={rcrLogo} alt="RCR" className="h-10 w-10 rounded-full" />
            <span className="text-sm font-semibold text-white/80">
              Réseau des Citoyens Responsables
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-white">
            Olon'andraikitra ! 👋
          </h2>
          <p className="mt-1 mb-7 text-sm text-white/55">
            Veuillez entrer vos identifiants pour commencer
          </p>

          {/* Error */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-400/40 bg-red-500/20 px-4 py-3 text-sm text-red-200">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-white/60"
              >
                Email ou nom d'utilisateur
              </label>
              <input
                id="email"
                type="text"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@rcr.mg"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/30 outline-none transition-all focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-white/60"
                >
                  Mot de passe
                </label>
                <a
                  href="#"
                  className="text-xs text-white/50 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="············"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-11 text-white placeholder-white/30 outline-none transition-all focus:border-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-900 shadow-lg transition-all hover:bg-white/90 active:scale-95 disabled:opacity-60"
            >
              {loginMutation.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-gray-900" />
              ) : (
                <LogIn size={17} />
              )}
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
