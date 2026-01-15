import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  Building2, 
  MapPin, 
  Calendar, 
  FileText, 
  Edit3, 
  Save, 
  X,
  Camera,
  Upload,
  History,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const sectors = [
  "صحية", "تعليمية", "صناعية", "زراعية", "رياضية", "ثقافية", "اجتماعية", 
  "دينية", "نقل", "تجارة", "سياحة", "إدارية", "قضائية", "سياسية", 
  "مالية", "كهربائية", "مائية", "تكنولوجية", "بيئية"
];

const ownershipTypes = ["ملكية كاملة", "إيجار", "شراكة", "مملوكة مع جهة أخرى"];
const legalDomains = ["مجال عام للجهة", "مجال خاص للجهة", "خارج ملكية الجهة"];
const facilityTypes = ["خاص", "محال", "تنسيق"];
const statusOptions = ["نشط", "غير نشط", "قيد الإنشاء", "معلق"];

// Mock data for facility
const mockFacility = {
  id: "1",
  name: "مستشفى المدينة المركزي",
  shortName: "م.م.م",
  legalName: "مستشفى المدينة المركزي العمومي",
  sector: "صحية",
  activityType: "خدمات طبية شاملة",
  facilityType: "عام",
  jurisdictionType: "خاص",
  createdDate: "2015-03-15",
  description: "مستشفى عمومي يقدم خدمات طبية شاملة للمواطنين في المنطقة الشمالية، يضم أقسام متخصصة في الجراحة والطب الباطني وطب الأطفال.",
  location: {
    gps: "36.7538, 3.0588",
    accuracy: "عالية",
    region: "المنطقة الشمالية",
    address: "شارع الاستقلال، حي النور"
  },
  ownership: "ملكية كاملة",
  legalDomain: "مجال عام للجهة",
  status: "نشط",
  license: {
    number: "LIC-2024-00145",
    issueDate: "2024-01-15",
    expiryDate: "2025-12-30",
    status: "ساري"
  }
};

const FacilityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [facility, setFacility] = useState(mockFacility);
  const [editedFacility, setEditedFacility] = useState(mockFacility);

  const handleSave = () => {
    setFacility(editedFacility);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedFacility(facility);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      "نشط": "bg-success text-success-foreground",
      "ساري": "bg-success text-success-foreground",
      "غير نشط": "bg-muted text-muted-foreground",
      "قيد الإنشاء": "bg-warning text-warning-foreground",
      "معلق": "bg-critical text-critical-foreground",
    };
    return statusConfig[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              لوحة التحكم
            </button>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">
              المنشآت
            </button>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-foreground">{facility.name}</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-accent flex items-center justify-center">
                <Building2 className="w-8 h-8 text-accent-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{facility.name}</h1>
                  <Badge className={getStatusBadge(facility.status)}>{facility.status}</Badge>
                </div>
                <p className="text-muted-foreground">{facility.shortName} • {facility.sector}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="w-4 h-4" />
                    إلغاء
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit3 className="w-4 h-4" />
                  تعديل البيانات
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="bg-muted p-1 rounded-lg">
              <TabsTrigger value="basic" className="gap-2 data-[state=active]:bg-card">
                <FileText className="w-4 h-4" />
                البيانات الأساسية
              </TabsTrigger>
              <TabsTrigger value="location" className="gap-2 data-[state=active]:bg-card">
                <MapPin className="w-4 h-4" />
                الموقع الجغرافي
              </TabsTrigger>
              <TabsTrigger value="legal" className="gap-2 data-[state=active]:bg-card">
                <Calendar className="w-4 h-4" />
                الوضع القانوني
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-card">
                <History className="w-4 h-4" />
                سجل التعديلات
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Info Card */}
                <div className="card-institutional space-y-5">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">معلومات المنشأة</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">اسم المنشأة</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.name}
                          onChange={(e) => setEditedFacility({...editedFacility, name: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.name}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-sm">اختصار الاسم</Label>
                        {isEditing ? (
                          <Input 
                            value={editedFacility.shortName}
                            onChange={(e) => setEditedFacility({...editedFacility, shortName: e.target.value})}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-foreground mt-1">{facility.shortName}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">تاريخ الإنشاء</Label>
                        {isEditing ? (
                          <Input 
                            type="date"
                            value={editedFacility.createdDate}
                            onChange={(e) => setEditedFacility({...editedFacility, createdDate: e.target.value})}
                            className="mt-1"
                          />
                        ) : (
                          <p className="font-medium text-foreground mt-1">{facility.createdDate}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">الاسم القانوني</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.legalName}
                          onChange={(e) => setEditedFacility({...editedFacility, legalName: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.legalName}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">الوصف العام</Label>
                      {isEditing ? (
                        <Textarea 
                          value={editedFacility.description}
                          onChange={(e) => setEditedFacility({...editedFacility, description: e.target.value})}
                          className="mt-1 min-h-[100px]"
                        />
                      ) : (
                        <p className="text-foreground mt-1 leading-relaxed">{facility.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Classification Card */}
                <div className="card-institutional space-y-5">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">التصنيف والنشاط</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">القطاع</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.sector}
                          onValueChange={(value) => setEditedFacility({...editedFacility, sector: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sectors.map((sector) => (
                              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.sector}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">نوع النشاط</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.activityType}
                          onChange={(e) => setEditedFacility({...editedFacility, activityType: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.activityType}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">صفة المنشأة</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.facilityType}
                          onChange={(e) => setEditedFacility({...editedFacility, facilityType: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.facilityType}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">نوع الاختصاص</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.jurisdictionType}
                          onValueChange={(value) => setEditedFacility({...editedFacility, jurisdictionType: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {facilityTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.jurisdictionType}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">الحالة</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.status}
                          onValueChange={(value) => setEditedFacility({...editedFacility, status: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getStatusBadge(facility.status)}>{facility.status}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Images Card */}
                <div className="card-institutional lg:col-span-2">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 mb-4">صور المنشأة</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer">
                      {isEditing ? (
                        <div className="text-center">
                          <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                          <span className="text-sm text-muted-foreground">رفع صورة</span>
                        </div>
                      ) : (
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-institutional space-y-5">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">إحداثيات GPS</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">الإحداثيات</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.location.gps}
                          onChange={(e) => setEditedFacility({
                            ...editedFacility, 
                            location: {...editedFacility.location, gps: e.target.value}
                          })}
                          className="mt-1"
                          placeholder="خط العرض، خط الطول"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1 font-mono">{facility.location.gps}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">دقة الموقع</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="font-medium text-foreground">{facility.location.accuracy}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">المنطقة</Label>
                      {isEditing ? (
                        <Input 
                          value={editedFacility.location.region}
                          onChange={(e) => setEditedFacility({
                            ...editedFacility, 
                            location: {...editedFacility.location, region: e.target.value}
                          })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.location.region}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">العنوان التفصيلي</Label>
                      {isEditing ? (
                        <Textarea 
                          value={editedFacility.location.address}
                          onChange={(e) => setEditedFacility({
                            ...editedFacility, 
                            location: {...editedFacility.location, address: e.target.value}
                          })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.location.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="card-institutional">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 mb-4">الخريطة</h2>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">معاينة الموقع على الخريطة</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Legal Tab */}
            <TabsContent value="legal" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ownership Card */}
                <div className="card-institutional space-y-5">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">وضعية الملكية</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">نوع الملكية</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.ownership}
                          onValueChange={(value) => setEditedFacility({...editedFacility, ownership: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ownershipTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.ownership}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">المجال القانوني</Label>
                      {isEditing ? (
                        <Select 
                          value={editedFacility.legalDomain}
                          onValueChange={(value) => setEditedFacility({...editedFacility, legalDomain: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {legalDomains.map((domain) => (
                              <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{facility.legalDomain}</p>
                      )}
                    </div>

                    {(facility.ownership === "شراكة" || facility.ownership === "مملوكة مع جهة أخرى") && (
                      <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                        <div className="flex items-center gap-2 text-warning-foreground">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">مستندات إضافية مطلوبة</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* License Card */}
                <div className="card-institutional space-y-5">
                  <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">بيانات الترخيص</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">رقم الترخيص</Label>
                      <p className="font-medium text-foreground mt-1 font-mono">{facility.license.number}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-sm">تاريخ الإصدار</Label>
                        <p className="font-medium text-foreground mt-1">{facility.license.issueDate}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">تاريخ الانتهاء</Label>
                        <p className="font-medium text-foreground mt-1">{facility.license.expiryDate}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground text-sm">حالة الترخيص</Label>
                      <div className="mt-1">
                        <Badge className={getStatusBadge(facility.license.status)}>
                          {facility.license.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <div className="card-institutional">
                <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3 mb-4">سجل التعديلات</h2>
                <div className="space-y-4">
                  {[
                    { date: "2024-12-15 14:30", user: "أحمد محمد", action: "تحديث بيانات الموقع" },
                    { date: "2024-11-20 10:15", user: "سارة علي", action: "تجديد الترخيص" },
                    { date: "2024-10-05 09:00", user: "محمد خالد", action: "إنشاء السجل" },
                  ].map((log, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{log.action}</p>
                        <p className="text-sm text-muted-foreground">بواسطة: {log.user}</p>
                      </div>
                      <span className="text-sm text-muted-foreground font-mono">{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default FacilityDetails;
