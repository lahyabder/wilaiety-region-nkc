import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUserRole } from "@/hooks/useAuth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity, Search, Filter, LogIn, LogOut, Key, UserPlus, Shield } from "lucide-react";

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string | null;
  action: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

const actionLabels: Record<string, { label: string; icon: typeof LogIn; color: string }> = {
  login: { label: "Connexion", icon: LogIn, color: "bg-green-500/10 text-green-600" },
  logout: { label: "Déconnexion", icon: LogOut, color: "bg-gray-500/10 text-gray-600" },
  password_change: { label: "Changement de mot de passe", icon: Key, color: "bg-blue-500/10 text-blue-600" },
  password_reset_by_admin: { label: "Réinitialisation du mot de passe", icon: Key, color: "bg-orange-500/10 text-orange-600" },
  user_created: { label: "Création d'utilisateur", icon: UserPlus, color: "bg-purple-500/10 text-purple-600" },
  role_changed: { label: "Changement de rôle", icon: Shield, color: "bg-yellow-500/10 text-yellow-600" },
};

const ActivityLogsPage = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole(user?.id);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
  }, [user?.id, isAdmin]);

  const fetchLogs = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // If not admin, only fetch own logs
      if (!isAdmin) {
        query = query.eq("user_id", user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data as ActivityLog[]) || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionInfo = (action: string) => {
    return actionLabels[action] || { label: action, icon: Activity, color: "bg-gray-500/10 text-gray-600" };
  };

  const uniqueActions = [...new Set(logs.map((log) => log.action))];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Journal d'activités</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "Afficher toutes les activités des utilisateurs dans le système" : "Afficher vos activités dans le système"}
            </p>
          </div>

          {/* Filtres */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par e-mail ou activité..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 ml-2" />
                      <SelectValue placeholder="Type d'activité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les activités</SelectItem>
                      {uniqueActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {getActionInfo(action).label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des journaux */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activités récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading || roleLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune activité enregistrée</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">Activité</TableHead>
                      {isAdmin && <TableHead className="text-right">Utilisateur</TableHead>}
                      <TableHead className="text-right">Date et heure</TableHead>
                      <TableHead className="text-right">Adresse IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const actionInfo = getActionInfo(log.action);
                      const ActionIcon = actionInfo.icon;
                      return (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant="secondary" className={actionInfo.color}>
                              <ActionIcon className="w-3 h-3 ml-1" />
                              {actionInfo.label}
                            </Badge>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>{log.user_email || "-"}</TableCell>
                          )}
                          <TableCell>
                            {format(new Date(log.created_at), "dd MMM yyyy - HH:mm", { locale: fr })}
                          </TableCell>
                          <TableCell dir="ltr" className="text-right font-mono text-sm">
                            {log.ip_address || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

export default ActivityLogsPage;
