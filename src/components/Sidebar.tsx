import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  FileText, 
  Users, 
  Settings,
  ChevronRight,
  BarChart3,
  Activity
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/" },
  { icon: Building2, label: "Établissements", path: "/" },
  { icon: MapPin, label: "Carte", path: "/map" },
  { icon: FileText, label: "Licences", path: "/licenses" },
  { icon: BarChart3, label: "Rapports", path: "/reports" },
  { icon: Users, label: "Utilisateurs", path: "/users" },
  { icon: Activity, label: "Journal d'activité", path: "/activity-logs" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string, label: string) => {
    if (label === "Tableau de bord" && location.pathname === "/") return true;
    if (label === "Carte" && location.pathname === "/map") return true;
    if (label === "Licences" && location.pathname === "/licenses") return true;
    if (label === "Rapports" && location.pathname === "/reports") return true;
    if (label === "Utilisateurs" && location.pathname === "/users") return true;
    if (label === "Journal d'activité" && location.pathname === "/activity-logs") return true;
    if (label === "Paramètres" && location.pathname === "/settings") return true;
    return false;
  };

  return (
    <aside className={`bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors mb-4"
        >
          <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
        
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive(item.path, item.label)
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;