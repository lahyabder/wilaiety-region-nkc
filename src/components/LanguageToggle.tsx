import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={(value: "fr" | "ar") => setLanguage(value)}>
      <SelectTrigger className="w-auto gap-2 bg-primary-foreground/10 border-0 text-primary-foreground hover:bg-primary-foreground/20 focus:ring-primary-foreground/30">
        <Languages className="w-4 h-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-background border shadow-lg z-50">
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="ar">العربية</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageToggle;
