import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-react";
import { 
  useAllAdministrativeDivisions, 
  useCreateDivision, 
  useUpdateDivision, 
  useDeleteDivision,
  type AdministrativeDivision 
} from "@/hooks/useAdministrativeDivisions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const divisionTypes = [
  { value: "ولاية", label: "ولاية", labelFr: "Wilaya" },
  { value: "مقاطعة", label: "مقاطعة", labelFr: "Moughataa" },
  { value: "بلدية", label: "بلدية", labelFr: "Commune" },
  { value: "منطقة حرة", label: "منطقة حرة", labelFr: "Zone Franche" },
];

const AdministrativeDivisionsManager = () => {
  const { t } = useLanguage();
  const { data: divisions, isLoading } = useAllAdministrativeDivisions();
  const createDivision = useCreateDivision();
  const updateDivision = useUpdateDivision();
  const deleteDivision = useDeleteDivision();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<AdministrativeDivision | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    name_fr: "",
    gps_coordinates: "",
    division_type: "بلدية",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      name_fr: "",
      gps_coordinates: "",
      division_type: "بلدية",
    });
  };

  const handleAdd = async () => {
    await createDivision.mutateAsync({
      name: formData.name,
      name_fr: formData.name_fr,
      gps_coordinates: formData.gps_coordinates || undefined,
      division_type: formData.division_type,
    });
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = async () => {
    if (!selectedDivision) return;
    
    await updateDivision.mutateAsync({
      id: selectedDivision.id,
      name: formData.name,
      name_fr: formData.name_fr,
      gps_coordinates: formData.gps_coordinates || null,
      division_type: formData.division_type,
    });
    resetForm();
    setIsEditDialogOpen(false);
    setSelectedDivision(null);
  };

  const handleDelete = async () => {
    if (!selectedDivision) return;
    await deleteDivision.mutateAsync(selectedDivision.id);
    setDeleteDialogOpen(false);
    setSelectedDivision(null);
  };

  const handleToggleActive = async (division: AdministrativeDivision) => {
    await updateDivision.mutateAsync({
      id: division.id,
      is_active: !division.is_active,
    });
  };

  const openEditDialog = (division: AdministrativeDivision) => {
    setSelectedDivision(division);
    setFormData({
      name: division.name,
      name_fr: division.name_fr,
      gps_coordinates: division.gps_coordinates || "",
      division_type: division.division_type,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (division: AdministrativeDivision) => {
    setSelectedDivision(division);
    setDeleteDialogOpen(true);
  };

  const getDivisionTypeLabel = (type: string) => {
    const found = divisionTypes.find(d => d.value === type);
    return found ? t(found.labelFr, found.label) : type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t("Divisions administratives", "التقسيمات الإدارية")}
          </CardTitle>
          <CardDescription>
            {t("Gérer les divisions administratives (wilayas, moughataas, communes)", "إدارة التقسيمات الإدارية (الولايات، المقاطعات، البلديات)")}
          </CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 me-2" />
              {t("Ajouter", "إضافة")}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>{t("Ajouter une division administrative", "إضافة تقسيم إداري")}</DialogTitle>
              <DialogDescription>
                {t("Remplissez les informations de la nouvelle division", "أدخل معلومات التقسيم الإداري الجديد")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("Nom (Arabe)", "الاسم (عربي)")} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("Ex: بلدية نواذيبو", "مثال: بلدية نواذيبو")}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("Nom (Français)", "الاسم (فرنسي)")} *</Label>
                <Input
                  value={formData.name_fr}
                  onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                  placeholder="Ex: Commune de Nouadhibou"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("Type de division", "نوع التقسيم")} *</Label>
                <Select
                  value={formData.division_type}
                  onValueChange={(value) => setFormData({ ...formData, division_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {divisionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {t(type.labelFr, type.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("Coordonnées GPS", "إحداثيات GPS")}</Label>
                <Input
                  value={formData.gps_coordinates}
                  onChange={(e) => setFormData({ ...formData, gps_coordinates: e.target.value })}
                  placeholder="20.9420, -17.0470"
                  dir="ltr"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t("Annuler", "إلغاء")}
              </Button>
              <Button 
                onClick={handleAdd} 
                disabled={!formData.name || !formData.name_fr || createDivision.isPending}
              >
                {createDivision.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
                {t("Ajouter", "إضافة")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("Nom", "الاسم")}</TableHead>
              <TableHead>{t("Type", "النوع")}</TableHead>
              <TableHead>{t("Coordonnées GPS", "إحداثيات GPS")}</TableHead>
              <TableHead>{t("Actif", "نشط")}</TableHead>
              <TableHead className="text-center">{t("Actions", "الإجراءات")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {divisions?.map((division) => (
              <TableRow key={division.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{division.name}</div>
                    <div className="text-sm text-muted-foreground">{division.name_fr}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{getDivisionTypeLabel(division.division_type)}</Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {division.gps_coordinates || "-"}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={division.is_active}
                    onCheckedChange={() => handleToggleActive(division)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(division)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(division)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!divisions || divisions.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t("Aucune division administrative", "لا توجد تقسيمات إدارية")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>{t("Modifier la division administrative", "تعديل التقسيم الإداري")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("Nom (Arabe)", "الاسم (عربي)")} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Nom (Français)", "الاسم (فرنسي)")} *</Label>
              <Input
                value={formData.name_fr}
                onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("Type de division", "نوع التقسيم")} *</Label>
              <Select
                value={formData.division_type}
                onValueChange={(value) => setFormData({ ...formData, division_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {divisionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.labelFr, type.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("Coordonnées GPS", "إحداثيات GPS")}</Label>
              <Input
                value={formData.gps_coordinates}
                onChange={(e) => setFormData({ ...formData, gps_coordinates: e.target.value })}
                dir="ltr"
                className="font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("Annuler", "إلغاء")}
            </Button>
            <Button 
              onClick={handleEdit} 
              disabled={!formData.name || !formData.name_fr || updateDivision.isPending}
            >
              {updateDivision.isPending && <Loader2 className="w-4 h-4 me-2 animate-spin" />}
              {t("Enregistrer", "حفظ")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Confirmer la suppression", "تأكيد الحذف")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `Êtes-vous sûr de vouloir supprimer "${selectedDivision?.name_fr}" ?`,
                `هل أنت متأكد من حذف "${selectedDivision?.name}"؟`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Annuler", "إلغاء")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("Supprimer", "حذف")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdministrativeDivisionsManager;
