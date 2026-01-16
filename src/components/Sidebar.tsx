import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  FileText, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Activity
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  const menuItems = [
    { icon: LayoutDashboard, label: t("Tableau de bord", "لوحة التحكم"), path: "/" },
    { icon: Building2, label: t("Établissements", "المنشآت"), path: "/" },
    { icon: MapPin, label: t("Carte", "الخريطة"), path: "/map" },
    { icon: FileText, label: t("Licences", "التراخيص"), path: "/licenses" },
    { icon: BarChart3, label: t("Rapports", "التقارير"), path: "/reports" },
    { icon: Users, label: t("Utilisateurs", "المستخدمون"), path: "/users" },
    { icon: Activity, label: t("Journal d'activité", "سجل النشاط"), path: "/activity-logs" },
    { icon: Settings, label: t("Paramètres", "الإعدادات"), path: "/settings" },
  ];

  const isActive = (path: string, index: number) => {
    if (index === 0 && location.pathname === "/") return true;
    if (index === 2 && location.pathname === "/map") return true;
    if (index === 3 && location.pathname === "/licenses") return true;
    if (index === 4 && location.pathname === "/reports") return true;
    if (index === 5 && location.pathname === "/users") return true;
    if (index === 6 && location.pathname === "/activity-logs") return true;
    if (index === 7 && location.pathname === "/settings") return true;
    return false;
  };

  const isRtl = language === "ar";
  const CollapseIcon = isRtl 
    ? (collapsed ? ChevronLeft : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  return (
    <aside className={`bg-card border-e border-border h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors mb-4"
        >
          <CollapseIcon className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive(item.path, index)
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;