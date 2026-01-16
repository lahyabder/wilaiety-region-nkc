import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted/50 border-t py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t("Conception et développement:", "تصميم وبرمجة:")}{" "}
          <span className="font-medium text-foreground">
            {t("Dar Mauritanie", "دار موريتانيا")}
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
