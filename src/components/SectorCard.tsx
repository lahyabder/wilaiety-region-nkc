import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface SectorCardProps {
  name: string;
  arabicName?: string;
  icon: LucideIcon;
  count: number;
  onClick?: () => void;
}

const SectorCard = ({ name, arabicName, icon: Icon, count, onClick }: SectorCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to sector facilities page using Arabic name for DB compatibility
      navigate(`/sector/${encodeURIComponent(arabicName || name)}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="card-institutional hover:border-primary hover:shadow-md transition-all duration-200 text-start w-full group cursor-pointer p-3 sm:p-6"
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="p-2 sm:p-3 rounded-lg bg-accent group-hover:bg-primary/10 transition-colors flex-shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base truncate">{name}</h3>
          <p className="text-muted-foreground text-xs sm:text-sm">{count} {t("établissement(s)", "منشأة")}</p>
        </div>
      </div>
    </button>
  );
};

export default SectorCard;
