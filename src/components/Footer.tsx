import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted/50 border-t py-4 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          {t("Conception et développement:", "تصميم وبرمجة:")}{" "}
          <a 
            href="https://darmauritanie.art/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            {t("Dar Mauritanie", "دار موريتانيا")}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
