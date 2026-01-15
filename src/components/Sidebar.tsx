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

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", active: true },
  { icon: Building2, label: "المنشآت" },
  { icon: MapPin, label: "الخريطة" },
  { icon: FileText, label: "التراخيص" },
  { icon: BarChart3, label: "التقارير" },
  { icon: Users, label: "المستخدمون" },
  { icon: Settings, label: "الإعدادات" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

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
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                item.active 
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
