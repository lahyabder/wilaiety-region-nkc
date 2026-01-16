import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("Erreur 404 : L'utilisateur a tenté d'accéder à une route inexistante :", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <h2 className="mb-2 text-2xl font-semibold text-foreground">
          {t("Page non trouvée", "الصفحة غير موجودة")}
        </h2>
        <p className="mb-6 text-muted-foreground">
          {t(
            "Désolé, la page que vous recherchez n'existe pas ou a été déplacée.",
            "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
          )}
        </p>
        <Button asChild>
          <a href="/" className="gap-2">
            <Home className="w-4 h-4" />
            {t("Retour à l'accueil", "العودة للرئيسية")}
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
