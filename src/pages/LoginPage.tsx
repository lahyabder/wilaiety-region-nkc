import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Loader2, Shield, Info } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="min-h-screen bg-background flex flex-col" dir={dir}>
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            <span className="text-xl font-bold">ولايتي - Wilaiety</span>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          {/* Security Notice */}
          <Alert className="border-primary/50 bg-primary/5">
            <Shield className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              {t(
                "Cette connexion est réservée aux administrateurs autorisés uniquement.",
                "تسجيل الدخول مخصص للمسؤولين المعتمدين فقط."
              )}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                ولايتي - Wilaiety
              </CardTitle>
              <CardDescription className="text-base">
                {t("Plateforme de gestion des établissements", "منصة إدارة المرافق والجهات")}
              </CardDescription>
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
                    autoComplete="email"
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
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                  {t("Se connecter", "تسجيل الدخول")}
                </Button>
              </form>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "Pour obtenir un compte, contactez l'administrateur système de votre organisation.",
                      "للحصول على حساب، اتصل بمسؤول النظام في مؤسستك."
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Signals */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              {t("Nous ne collectons pas d'informations financières", "لا نجمع معلومات مالية")}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <Link to="/security" className="text-primary hover:underline">
                {t("Sécurité", "الأمان")}
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/privacy-policy" className="text-primary hover:underline">
                {t("Confidentialité", "الخصوصية")}
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/terms" className="text-primary hover:underline">
                {t("Conditions", "الشروط")}
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/contact" className="text-primary hover:underline">
                {t("Contact", "تواصل")}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 ولايتي - Wilaiety. {t("Tous droits réservés.", "جميع الحقوق محفوظة.")}</p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
