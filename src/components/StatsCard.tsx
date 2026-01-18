import { LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "critical";
}

const StatsCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatsCardProps) => {
  const { t } = useLanguage();
  
  const variantStyles = {
    default: "border-s-primary",
    success: "border-s-success",
    warning: "border-s-warning",
    critical: "border-s-critical",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning-foreground",
    critical: "bg-critical/10 text-critical",
  };

  return (
    <div className={`card-institutional border-s-4 ${variantStyles[variant]} animate-fade-in p-3 sm:p-6`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs sm:text-sm mb-1 whitespace-nowrap">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${trend.isPositive ? "text-success" : "text-critical"}`}>
              {trend.isPositive ? "+" : ""}{trend.value}% <span className="hidden sm:inline">{t("par rapport au mois précédent", "مقارنة بالشهر السابق")}</span>
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${iconStyles[variant]}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;