import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUserRole, type AppRole, type Profile } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Users, Search, UserPlus, Shield, User, Edit2, Trash2, Loader2 } from "lucide-react";

interface UserWithProfile extends Profile {
  email?: string;
  role?: AppRole;
}

const UsersPage = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole(user?.id);
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    job_title: "",
    department: "",
    role: "user" as AppRole,
  });

  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    job_title: "",
    department: "",
    role: "user" as AppRole,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast.error("خطأ في جلب بيانات المستخدمين");
      setLoading(false);
      return;
    }

    // Fetch roles
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }

    // Combine profiles with roles
    const usersWithRoles = (profiles || []).map((profile) => {
      const userRole = roles?.find((r) => r.user_id === profile.user_id);
      return {
        ...profile,
        role: (userRole?.role as AppRole) || "user",
      };
    });

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const handleCreateUser = async () => {
    if (!isAdmin) return;
    if (!createForm.email || !createForm.password || !createForm.full_name) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (createForm.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setSaving(true);
    try {
      // Create user through Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createForm.email,
        password: createForm.password,
        options: {
          data: {
            full_name: createForm.full_name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Wait a bit for the trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update profile with additional data
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: createForm.full_name,
            phone: createForm.phone || null,
            job_title: createForm.job_title || null,
            department: createForm.department || null,
          })
          .eq("user_id", authData.user.id);

        if (profileError) {
          console.error("Profile update error:", profileError);
        }

        // Update role if admin
        if (createForm.role === "admin") {
          const { error: roleError } = await supabase
            .from("user_roles")
            .update({ role: "admin" })
            .eq("user_id", authData.user.id);

          if (roleError) {
            console.error("Role update error:", roleError);
          }
        }

        toast.success("تم إنشاء المستخدم بنجاح");
        setCreateDialogOpen(false);
        setCreateForm({
          email: "",
          password: "",
          full_name: "",
          phone: "",
          job_title: "",
          department: "",
          role: "user",
        });
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.message || "خطأ في إنشاء المستخدم");
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = (u: UserWithProfile) => {
    setEditingUser(u);
    setEditForm({
      full_name: u.full_name || "",
      phone: u.phone || "",
      job_title: u.job_title || "",
      department: u.department || "",
      role: u.role || "user",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !isAdmin) return;

    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone || null,
          job_title: editForm.job_title || null,
          department: editForm.department || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", editingUser.user_id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: editForm.role })
        .eq("user_id", editingUser.user_id);

      if (roleError) throw roleError;

      toast.success("تم تحديث بيانات المستخدم بنجاح");
      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "خطأ في تحديث البيانات");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (u: UserWithProfile) => {
    if (!isAdmin) return;
    
    // Prevent deleting self
    if (u.user_id === user?.id) {
      toast.error("لا يمكنك حذف حسابك الحالي");
      return;
    }

    try {
      // Delete profile (this will cascade to user_roles due to RLS)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", u.user_id);

      if (error) throw error;

      toast.success("تم حذف المستخدم بنجاح");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "خطأ في حذف المستخدم");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string | null) => {
    if (!name) return "؟";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);
  };

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">إدارة المستخدمين</h1>
              <p className="text-muted-foreground">عرض وإدارة المستخدمين وصلاحياتهم</p>
            </div>
            {isAdmin && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 ml-2" />
                    إضافة مستخدم
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl" className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                    <DialogDescription>
                      أدخل بيانات المستخدم الجديد
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-email">البريد الإلكتروني *</Label>
                      <Input
                        id="create-email"
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-password">كلمة المرور *</Label>
                      <Input
                        id="create-password"
                        type="password"
                        value={createForm.password}
                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                        placeholder="6 أحرف على الأقل"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-name">الاسم الكامل *</Label>
                      <Input
                        id="create-name"
                        value={createForm.full_name}
                        onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                        placeholder="أدخل الاسم الكامل"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-phone">رقم الهاتف</Label>
                        <Input
                          id="create-phone"
                          value={createForm.phone}
                          onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                          placeholder="رقم الهاتف"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="create-job">المسمى الوظيفي</Label>
                        <Input
                          id="create-job"
                          value={createForm.job_title}
                          onChange={(e) => setCreateForm({ ...createForm, job_title: e.target.value })}
                          placeholder="المسمى الوظيفي"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-dept">القسم</Label>
                        <Input
                          id="create-dept"
                          value={createForm.department}
                          onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                          placeholder="القسم"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>الصلاحية</Label>
                        <Select
                          value={createForm.role}
                          onValueChange={(v) => setCreateForm({ ...createForm, role: v as AppRole })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">مستخدم</SelectItem>
                            <SelectItem value="admin">مدير</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateUser} disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                      إنشاء المستخدم
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                    <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">المديرون</p>
                    <p className="text-3xl font-bold text-foreground">{adminCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-chart-4/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-chart-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">المستخدمون</p>
                    <p className="text-3xl font-bold text-foreground">{userCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-chart-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو المنصب أو القسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              {loading || roleLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا يوجد مستخدمون</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right">المنصب</TableHead>
                      <TableHead className="text-right">القسم</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">الصلاحية</TableHead>
                      {isAdmin && <TableHead className="text-right">إجراءات</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={u.avatar_url || undefined} />
                              <AvatarFallback>{getInitials(u.full_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{u.full_name || "بدون اسم"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{u.job_title || "-"}</TableCell>
                        <TableCell>{u.department || "-"}</TableCell>
                        <TableCell dir="ltr" className="text-right">
                          {u.phone || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === "admin" ? "default" : "secondary"}
                          >
                            {u.role === "admin" ? "مدير" : "مستخدم"}
                          </Badge>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(u)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              
                              {u.user_id !== user?.id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent dir="rtl">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        سيتم حذف المستخدم "{u.full_name}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-row-reverse gap-2">
                                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteUser(u)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        حذف
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent dir="rtl" className="max-w-md">
              <DialogHeader>
                <DialogTitle>تعديل بيانات المستخدم</DialogTitle>
                <DialogDescription>
                  تعديل بيانات وصلاحيات المستخدم
                </DialogDescription>
              </DialogHeader>
              {editingUser && (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={editingUser.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(editingUser.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {editingUser.full_name || "بدون اسم"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">الاسم الكامل</Label>
                    <Input
                      id="edit-name"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      placeholder="أدخل الاسم الكامل"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">رقم الهاتف</Label>
                      <Input
                        id="edit-phone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="رقم الهاتف"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-job">المسمى الوظيفي</Label>
                      <Input
                        id="edit-job"
                        value={editForm.job_title}
                        onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                        placeholder="المسمى الوظيفي"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-dept">القسم</Label>
                      <Input
                        id="edit-dept"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        placeholder="القسم"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الصلاحية</Label>
                      <Select
                        value={editForm.role}
                        onValueChange={(v) => setEditForm({ ...editForm, role: v as AppRole })}
                        disabled={editingUser.user_id === user?.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">مستخدم</SelectItem>
                          <SelectItem value="admin">مدير</SelectItem>
                        </SelectContent>
                      </Select>
                      {editingUser.user_id === user?.id && (
                        <p className="text-xs text-muted-foreground">
                          لا يمكنك تغيير صلاحيتك
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleUpdateUser} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                  حفظ التغييرات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default UsersPage;
