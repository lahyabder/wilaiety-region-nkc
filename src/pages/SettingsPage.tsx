import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell, Palette, LogOut, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id);
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    job_title: "",
    department: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        job_title: profile.job_title || "",
        department: profile.department || "",
      });
    }
  }, [profile]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        job_title: formData.job_title,
        department: formData.department,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تحديث بيانات الملف الشخصي بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة غير متطابقة",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم تغيير كلمة المرور بنجاح",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "؟";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">الإعدادات</h1>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="w-4 h-4" />
                  الملف الشخصي
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="w-4 h-4" />
                  الأمان
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  الإشعارات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>الملف الشخصي</CardTitle>
                    <CardDescription>
                      إدارة معلومات حسابك الشخصية
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{profile?.full_name || "مستخدم"}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">الاسم الكامل</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="أدخل رقم الهاتف"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job_title">المسمى الوظيفي</Label>
                        <Input
                          id="job_title"
                          value={formData.job_title}
                          onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                          placeholder="أدخل المسمى الوظيفي"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">القسم</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          placeholder="أدخل اسم القسم"
                        />
                      </div>
                    </div>

                    <Button onClick={handleProfileUpdate} disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 ml-2" />
                      )}
                      حفظ التغييرات
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>الأمان</CardTitle>
                    <CardDescription>
                      إدارة كلمة المرور وإعدادات الأمان
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">تغيير كلمة المرور</h3>
                      <div className="grid gap-4 max-w-md">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="أدخل كلمة المرور الجديدة"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="أعد إدخال كلمة المرور"
                          />
                        </div>
                        <Button onClick={handlePasswordChange} disabled={saving} className="w-fit">
                          {saving ? (
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4 ml-2" />
                          )}
                          تغيير كلمة المرور
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-destructive mb-2">تسجيل الخروج</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        سيتم تسجيل خروجك من جميع الأجهزة
                      </p>
                      <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 ml-2" />
                        تسجيل الخروج
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>الإشعارات</CardTitle>
                    <CardDescription>
                      إدارة تفضيلات الإشعارات
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      إعدادات الإشعارات ستكون متاحة قريباً
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
