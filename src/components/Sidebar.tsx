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
  Activity,
  X
} from "lucide-react";
import { useState, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Context for mobile sidebar
interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

const menuItems = (t: (fr: string, ar: string) => string) => [
  { icon: LayoutDashboard, label: t("Tableau de bord", "لوحة التحكم"), path: "/" },
  { icon: Building2, label: t("Établissements", "المنشآت"), path: "/" },
  { icon: MapPin, label: t("Carte", "الخريطة"), path: "/map" },
  { icon: FileText, label: t("Licences", "التراخيص"), path: "/licenses" },
  { icon: BarChart3, label: t("Rapports", "التقارير"), path: "/reports" },
  { icon: Users, label: t("Utilisateurs", "المستخدمون"), path: "/users" },
  { icon: Activity, label: t("Journal d'activité", "سجل النشاط"), path: "/activity-logs" },
  { icon: Settings, label: t("Paramètres", "الإعدادات"), path: "/settings" },
];

// Mobile Sidebar using Sheet
export const MobileSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const sidebarContext = useSidebarContext();
  
  if (!sidebarContext) return null;
  
  const { isOpen, setIsOpen } = sidebarContext;

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

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent 
        side={language === "ar" ? "right" : "left"} 
        className="w-72 p-0"
      >
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">J</span>
            </div>
            <span className="font-bold text-xl">Jihety</span>
          </SheetTitle>
        </SheetHeader>
        
        <nav className="p-4 space-y-1">
          {menuItems(t).map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive(item.path, index)
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

// Desktop Sidebar
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

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
    <aside className={`hidden md:block bg-card border-e border-border h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors mb-4"
        >
          <CollapseIcon className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <nav className="space-y-1">
          {menuItems(t).map((item, index) => (
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