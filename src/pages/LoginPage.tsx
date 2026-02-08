import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { siteConfig } from "../site.config";

const LoginPage = () => {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(t("Email ou mot de passe incorrect", "البريد أو كلمة المرور غير صحيحة"));
      setLoading(false);
      return;
    }

    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-background rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1">{siteConfig.name}</h1>
          <p className="text-sm text-muted-foreground">
            {t("Connexion réservée aux responsables autorisés", "تسجيل الدخول مخصص للمسؤولين المعتمدين فقط")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">
              {t("Adresse e-mail", "البريد الإلكتروني")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">
              {t("Mot de passe", "كلمة المرور")}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? t("Connexion...", "جاري تسجيل الدخول...")
              : t("Se connecter", "تسجيل الدخول")}
          </Button>
        </form>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
