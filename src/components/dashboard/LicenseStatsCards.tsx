import { FileText, AlertTriangle, XCircle, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLicenses } from "@/hooks/useLicenses";
import { Skeleton } from "@/components/ui/skeleton";

interface LicenseStatsCardsProps {
  totalFacilities: number;
}

const LicenseStatsCards = ({ totalFacilities }: LicenseStatsCardsProps) => {
  const { t } = useLanguage();
  const { data: licenses, isLoading } = useLicenses();

  const totalLicenses = licenses?.length || 0;
  const expiringSoon = licenses?.filter(l => l.status === "قريب الانتهاء").length || 0;
  const expired = licenses?.filter(l => l.status === "منتهي").length || 0;

  const stats = [
    {
      title: t("Total des établissements", "إجمالي المنشآت"),
      value: totalFacilities,
      icon: Building2,
      color: "bg-primary/10 text-primary",
      borderColor: "border-primary",
    },
    {
      title: t("Total des licences", "إجمالي التراخيص"),
      value: totalLicenses,
      icon: FileText,
      color: "bg-muted text-muted-foreground",
      borderColor: "border-muted-foreground",
    },
    {
      title: t("Licences expirant bientôt", "تراخيص قريبة الانتهاء"),
      value: expiringSoon,
      icon: AlertTriangle,
      color: "bg-warning/10 text-warning-foreground",
      borderColor: "border-warning",
    },
    {
      title: t("Licences expirées", "تراخيص منتهية"),
      value: expired,
      icon: XCircle,
      color: "bg-critical/10 text-critical",
      borderColor: "border-critical",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-card rounded-xl p-4 sm:p-5 border ${stat.borderColor} border-s-4 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 line-clamp-2">
                {stat.title}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stat.value.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-xl ${stat.color} flex-shrink-0`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LicenseStatsCards;
