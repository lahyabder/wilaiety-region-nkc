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
} from "@/components/ui/dialog";
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
import { Users, Search, UserPlus, Shield, User, Edit2 } from "lucide-react";

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
  const [editRole, setEditRole] = useState<AppRole>("user");

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

  const handleUpdateRole = async () => {
    if (!editingUser || !isAdmin) return;

    const { error } = await supabase
      .from("user_roles")
      .update({ role: editRole })
      .eq("user_id", editingUser.user_id);

    if (error) {
      toast.error("خطأ في تحديث الصلاحية");
    } else {
      toast.success("تم تحديث الصلاحية بنجاح");
      fetchUsers();
      setEditingUser(null);
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">إدارة المستخدمين</h1>
            <p className="text-muted-foreground">عرض وإدارة المستخدمين وصلاحياتهم</p>
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingUser(u);
                                    setEditRole(u.role || "user");
                                  }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent dir="rtl">
                                <DialogHeader>
                                  <DialogTitle>تعديل صلاحية المستخدم</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage src={u.avatar_url || undefined} />
                                      <AvatarFallback>
                                        {getInitials(u.full_name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">
                                        {u.full_name || "بدون اسم"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>الصلاحية</Label>
                                    <Select
                                      value={editRole}
                                      onValueChange={(v) => setEditRole(v as AppRole)}
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
                                  <Button
                                    onClick={handleUpdateRole}
                                    className="w-full"
                                  >
                                    حفظ التغييرات
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default UsersPage;
