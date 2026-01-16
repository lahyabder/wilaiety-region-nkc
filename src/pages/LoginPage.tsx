import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

const LoginPage = () => {
  const { t, dir } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await signIn(email, password);

    if (error) {
      toast.error(t("Échec de la connexion: ", "فشل الاتصال: ") + error.message);
      setLoading(false);
      return;
    }

    // Log the login activity in background (don't wait)
    if (data?.user) {
      supabase.functions.invoke("log-activity", {
        body: {
          user_id: data.user.id,
          user_email: data.user.email,
          action: "login",
        },
      }).catch((logError) => {
        console.error("Failed to log activity:", logError);
      });
    }
    
    toast.success(t("Connexion réussie", "تم الاتصال بنجاح"));
    navigate("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={dir}>
      <div className="absolute top-4 end-4">
        <LanguageToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("Connexion", "تسجيل الدخول")}</CardTitle>
          <CardDescription>{t("Entrez vos identifiants pour accéder au système", "أدخل بيانات الاعتماد للوصول إلى النظام")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("E-mail", "البريد الإلكتروني")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("exemple@email.com", "exemple@email.com")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("Mot de passe", "كلمة المرور")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {t("Se connecter", "تسجيل الدخول")}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t("Pour obtenir un compte, contactez l'administrateur système", "للحصول على حساب، اتصل بمسؤول النظام")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;