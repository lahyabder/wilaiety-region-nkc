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
    <div className={`card-institutional border-s-4 ${variantStyles[variant]} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? "text-success" : "text-critical"}`}>
              {trend.isPositive ? "+" : ""}{trend.value}% {t("par rapport au mois précédent", "مقارنة بالشهر السابق")}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconStyles[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;