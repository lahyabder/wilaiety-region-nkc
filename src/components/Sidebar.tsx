import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  FileText, 
  Users, 
  Settings,
  ChevronLeft,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/" },
  { icon: Building2, label: "المنشآت", path: "/" },
  { icon: MapPin, label: "الخريطة", path: "/map" },
  { icon: FileText, label: "التراخيص", path: "/licenses" },
  { icon: BarChart3, label: "التقارير", path: "/reports" },
  { icon: Users, label: "المستخدمون", path: "/" },
  { icon: Settings, label: "الإعدادات", path: "/" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string, label: string) => {
    if (label === "لوحة التحكم" && location.pathname === "/") return true;
    if (label === "الخريطة" && location.pathname === "/map") return true;
    if (label === "التراخيص" && location.pathname === "/licenses") return true;
    if (label === "التقارير" && location.pathname === "/reports") return true;
    return false;
  };

  return (
    <aside className={`bg-card border-l border-border h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors mb-4"
        >
          <ChevronLeft className={`w-5 h-5 text-muted-foreground transition-transform ${collapsed ? "rotate-180" : ""}`} />
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
