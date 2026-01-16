import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "ar" : "fr");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-primary-foreground hover:bg-primary-foreground/10 gap-2"
    >
      <Languages className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language === "fr" ? "العربية" : "Français"}
      </span>
    </Button>
  );
};

export default LanguageToggle;
