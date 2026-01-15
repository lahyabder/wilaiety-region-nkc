import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import SectorCard from "@/components/SectorCard";
import FacilityCard from "@/components/FacilityCard";
import QuickActions from "@/components/QuickActions";
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Stethoscope,
  GraduationCap,
  Factory,
  Wheat,
  Dumbbell,
  Palette,
  Heart,
  Church,
  Bus,
  ShoppingCart,
  Plane,
  Landmark,
  Scale,
  Vote,
  Wallet,
  Zap,
  Droplets,
  Cpu,
  TreePine
} from "lucide-react";

const sectors = [
  { name: "صحية", icon: Stethoscope, count: 145 },
  { name: "تعليمية", icon: GraduationCap, count: 230 },
  { name: "صناعية", icon: Factory, count: 89 },
  { name: "زراعية", icon: Wheat, count: 67 },
  { name: "رياضية", icon: Dumbbell, count: 45 },
  { name: "ثقافية", icon: Palette, count: 38 },
  { name: "اجتماعية", icon: Heart, count: 92 },
  { name: "دينية", icon: Church, count: 156 },
  { name: "نقل", icon: Bus, count: 78 },
  { name: "تجارة", icon: ShoppingCart, count: 312 },
  { name: "سياحة", icon: Plane, count: 54 },
  { name: "إدارية", icon: Landmark, count: 123 },
  { name: "قضائية", icon: Scale, count: 28 },
  { name: "سياسية", icon: Vote, count: 15 },
  { name: "مالية", icon: Wallet, count: 67 },
  { name: "كهربائية", icon: Zap, count: 43 },
  { name: "مائية", icon: Droplets, count: 36 },
  { name: "تكنولوجية", icon: Cpu, count: 89 },
  { name: "بيئية", icon: TreePine, count: 27 },
];

const recentFacilities = [
  { name: "مستشفى المدينة المركزي", sector: "القطاع الصحي", location: "المنطقة الشمالية", status: "active" as const, licenseExpiry: "2025/12/30" },
  { name: "مدرسة النور الابتدائية", sector: "القطاع التعليمي", location: "المنطقة الوسطى", status: "pending" as const },
  { name: "مصنع الأمل للصناعات", sector: "القطاع الصناعي", location: "المنطقة الصناعية", status: "expired" as const, licenseExpiry: "2024/06/15" },
  { name: "نادي الشباب الرياضي", sector: "القطاع الرياضي", location: "المنطقة الجنوبية", status: "active" as const, licenseExpiry: "2026/03/20" },
];

const Index = () => {
  const totalFacilities = sectors.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            <p className="text-muted-foreground">نظرة عامة على منشآت الجهة</p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="إجمالي المنشآت"
              value={totalFacilities.toLocaleString("ar-SA")}
              icon={Building2}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="منشآت نشطة"
              value="١٬٤٨٩"
              icon={CheckCircle}
              variant="success"
            />
            <StatsCard
              title="قيد المراجعة"
              value="٨٧"
              icon={AlertTriangle}
              variant="warning"
            />
            <StatsCard
              title="تراخيص منتهية"
              value="٢٣"
              icon={XCircle}
              variant="critical"
            />
          </div>

          {/* Sectors Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">القطاعات</h2>
              <button className="text-primary hover:underline text-sm font-medium">
                عرض الكل
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sectors.slice(0, 10).map((sector, index) => (
                <SectorCard
                  key={index}
                  name={sector.name}
                  icon={sector.icon}
                  count={sector.count}
                />
              ))}
            </div>
          </div>

          {/* Recent Facilities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">آخر المنشآت</h2>
              <button className="text-primary hover:underline text-sm font-medium">
                عرض الكل
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentFacilities.map((facility, index) => (
                <FacilityCard
                  key={index}
                  {...facility}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} جهتي - منصة سيادية لإدارة البيانات المؤسساتية
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
