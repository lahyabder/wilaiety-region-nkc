import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell, LogOut, Save, Loader2, Camera, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id);
  const { toast } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("Erreur", "خطأ"),
        description: t("Veuillez sélectionner un fichier image valide", "يرجى اختيار ملف صورة صالح"),
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t("Erreur", "خطأ"),
        description: t("La taille de l'image doit être inférieure à 2 Mo", "يجب أن يكون حجم الصورة أقل من 2 ميجابايت"),
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      await supabase.storage.from("avatars").remove([filePath]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast({
        title: t("Téléchargé", "تم الرفع"),
        description: t("La photo de profil a été mise à jour avec succès", "تم تحديث صورة الملف الشخصي بنجاح"),
      });
    } catch (error: any) {
      toast({
        title: t("Erreur", "خطأ"),
        description: error.message || t("Une erreur s'est produite lors du téléchargement de l'image", "حدث خطأ أثناء رفع الصورة"),
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setUploadingAvatar(true);
    try {
      // Remove from storage
      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`]);

      // Update profile
      const { error: updateError } = await updateProfile({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      setAvatarUrl(null);
      toast({
        title: t("Supprimé", "تم الحذف"),
        description: t("La photo de profil a été supprimée", "تم حذف صورة الملف الشخصي"),
      });
    } catch (error: any) {
      toast({
        title: t("Erreur", "خطأ"),
        description: error.message || t("Une erreur s'est produite lors de la suppression de l'image", "حدث خطأ أثناء حذف الصورة"),
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

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
        title: t("Enregistré", "تم الحفظ"),
        description: t("Les données du profil ont été mises à jour avec succès", "تم تحديث بيانات الملف الشخصي بنجاح"),
      });
    } catch (error: any) {
      toast({
        title: t("Erreur", "خطأ"),
        description: error.message || t("Une erreur s'est produite lors de la mise à jour des données", "حدث خطأ أثناء تحديث البيانات"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t("Erreur", "خطأ"),
        description: t("Le nouveau mot de passe ne correspond pas", "كلمة المرور الجديدة غير متطابقة"),
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: t("Erreur", "خطأ"),
        description: t("Le mot de passe doit contenir au moins 6 caractères", "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل"),
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
        title: t("Enregistré", "تم الحفظ"),
        description: t("Le mot de passe a été changé avec succès", "تم تغيير كلمة المرور بنجاح"),
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: t("Erreur", "خطأ"),
        description: error.message || t("Une erreur s'est produite lors du changement de mot de passe", "حدث خطأ أثناء تغيير كلمة المرور"),
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
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 min-w-0">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t("Paramètres", "الإعدادات")}</h1>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="w-4 h-4" />
                  {t("Profil", "الملف الشخصي")}
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="w-4 h-4" />
                  {t("Sécurité", "الأمان")}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  {t("Notifications", "الإشعارات")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Profil", "الملف الشخصي")}</CardTitle>
                    <CardDescription>
                      {t("Gérer les informations de votre compte personnel", "إدارة معلومات حسابك الشخصي")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={avatarUrl || ""} />
                          <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                            {getInitials(profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        {uploadingAvatar && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">{profile?.full_name || t("Utilisateur", "مستخدم")}</h3>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <div className="flex gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingAvatar}
                          >
                            <Camera className="w-4 h-4 me-2" />
                            {t("Changer la photo", "تغيير الصورة")}
                          </Button>
                          {avatarUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveAvatar}
                              disabled={uploadingAvatar}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 me-2" />
                              {t("Supprimer", "حذف")}
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("Maximum : 2 Mo (JPG, PNG, WebP)", "الحد الأقصى: 2 ميجابايت (JPG، PNG، WebP)")}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">{t("Nom complet", "الاسم الكامل")}</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder={t("Entrez votre nom complet", "أدخل اسمك الكامل")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t("Numéro de téléphone", "رقم الهاتف")}</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder={t("Entrez le numéro de téléphone", "أدخل رقم الهاتف")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job_title">{t("Intitulé du poste", "المسمى الوظيفي")}</Label>
                        <Input
                          id="job_title"
                          value={formData.job_title}
                          onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                          placeholder={t("Entrez l'intitulé du poste", "أدخل المسمى الوظيفي")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">{t("Département", "القسم")}</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          placeholder={t("Entrez le nom du département", "أدخل اسم القسم")}
                        />
                      </div>
                    </div>

                    <Button onClick={handleProfileUpdate} disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-4 h-4 me-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 me-2" />
                      )}
                      {t("Enregistrer les modifications", "حفظ التعديلات")}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Sécurité", "الأمان")}</CardTitle>
                    <CardDescription>
                      {t("Gérer le mot de passe et les paramètres de sécurité", "إدارة كلمة المرور وإعدادات الأمان")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">{t("Changer le mot de passe", "تغيير كلمة المرور")}</h3>
                      <div className="grid gap-4 max-w-md">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">{t("Nouveau mot de passe", "كلمة المرور الجديدة")}</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder={t("Entrez le nouveau mot de passe", "أدخل كلمة المرور الجديدة")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">{t("Confirmer le mot de passe", "تأكيد كلمة المرور")}</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder={t("Réentrez le mot de passe", "أعد إدخال كلمة المرور")}
                          />
                        </div>
                        <Button onClick={handlePasswordChange} disabled={saving} className="w-fit">
                          {saving ? (
                            <Loader2 className="w-4 h-4 me-2 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4 me-2" />
                          )}
                          {t("Changer le mot de passe", "تغيير كلمة المرور")}
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-destructive mb-2">{t("Déconnexion", "تسجيل الخروج")}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("Vous serez déconnecté de tous les appareils", "سيتم تسجيل خروجك من جميع الأجهزة")}
                      </p>
                      <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 me-2" />
                        {t("Se déconnecter", "تسجيل الخروج")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Notifications", "الإشعارات")}</CardTitle>
                    <CardDescription>
                      {t("Gérer les préférences de notifications", "إدارة تفضيلات الإشعارات")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {t("Les paramètres de notifications seront bientôt disponibles", "إعدادات الإشعارات ستكون متاحة قريبًا")}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SettingsPage;
