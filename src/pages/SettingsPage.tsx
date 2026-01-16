import { useState, useEffect, useRef } from "react";
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
import { User, Lock, Bell, LogOut, Save, Loader2, Camera, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id);
  const { toast } = useToast();
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
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image valide",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "La taille de l'image doit être inférieure à 2 Mo",
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
        title: "Téléchargé",
        description: "La photo de profil a été mise à jour avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors du téléchargement de l'image",
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
        title: "Supprimé",
        description: "La photo de profil a été supprimée",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la suppression de l'image",
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
        title: "Enregistré",
        description: "Les données du profil ont été mises à jour avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la mise à jour des données",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe ne correspond pas",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
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
        title: "Enregistré",
        description: "Le mot de passe a été changé avec succès",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors du changement de mot de passe",
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
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="w-4 h-4" />
                  Profil
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="w-4 h-4" />
                  Sécurité
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profil</CardTitle>
                    <CardDescription>
                      Gérer les informations de votre compte personnel
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
                        <h3 className="font-medium">{profile?.full_name || "Utilisateur"}</h3>
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
                            <Camera className="w-4 h-4 ml-2" />
                            Changer la photo
                          </Button>
                          {avatarUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveAvatar}
                              disabled={uploadingAvatar}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              Supprimer
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Maximum : 2 Mo (JPG, PNG, WebP)
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nom complet</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Entrez votre nom complet"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Numéro de téléphone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="Entrez le numéro de téléphone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="job_title">Intitulé du poste</Label>
                        <Input
                          id="job_title"
                          value={formData.job_title}
                          onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                          placeholder="Entrez l'intitulé du poste"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Département</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          placeholder="Entrez le nom du département"
                        />
                      </div>
                    </div>

                    <Button onClick={handleProfileUpdate} disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 ml-2" />
                      )}
                      Enregistrer les modifications
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Sécurité</CardTitle>
                    <CardDescription>
                      Gérer le mot de passe et les paramètres de sécurité
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Changer le mot de passe</h3>
                      <div className="grid gap-4 max-w-md">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="Entrez le nouveau mot de passe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="Réentrez le mot de passe"
                          />
                        </div>
                        <Button onClick={handlePasswordChange} disabled={saving} className="w-fit">
                          {saving ? (
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          ) : (
                            <Lock className="w-4 h-4 ml-2" />
                          )}
                          Changer le mot de passe
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-destructive mb-2">Déconnexion</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Vous serez déconnecté de tous les appareils
                      </p>
                      <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 ml-2" />
                        Se déconnecter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Gérer les préférences de notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Les paramètres de notifications seront bientôt disponibles
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
