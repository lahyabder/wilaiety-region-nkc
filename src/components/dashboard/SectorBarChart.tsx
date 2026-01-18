import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FacilitySector } from "@/hooks/useFacilities";

interface SectorBarChartProps {
  sectorCounts: Record<FacilitySector, number>;
}

const sectorLabels: Record<FacilitySector, { ar: string; fr: string }> = {
  "صحية": { ar: "صحية", fr: "Santé" },
  "تعليمية": { ar: "تعليمية", fr: "Éducation" },
  "صناعية": { ar: "صناعية", fr: "Industrie" },
  "زراعية": { ar: "زراعية", fr: "Agriculture" },
  "رياضية": { ar: "رياضية", fr: "Sport" },
  "ثقافية": { ar: "ثقافية", fr: "Culture" },
  "اجتماعية": { ar: "اجتماعية", fr: "Social" },
  "دينية": { ar: "دينية", fr: "Religieux" },
  "نقل": { ar: "نقل", fr: "Transport" },
  "تجارة": { ar: "تجارة", fr: "Commerce" },
  "سياحة": { ar: "سياحة", fr: "Tourisme" },
  "إدارية": { ar: "إدارية", fr: "Administratif" },
  "قضائية": { ar: "قضائية", fr: "Judiciaire" },
  "سياسية": { ar: "سياسية", fr: "Politique" },
  "مالية": { ar: "مالية", fr: "Finance" },
  "كهربائية": { ar: "كهربائية", fr: "Électricité" },
  "مائية": { ar: "مائية", fr: "Eau" },
  "تكنولوجية": { ar: "تكنولوجية", fr: "Technologie" },
  "بيئية": { ar: "بيئية", fr: "Environnement" },
};

const SectorBarChart = ({ sectorCounts }: SectorBarChartProps) => {
  const { t, language } = useLanguage();

  const data = Object.entries(sectorCounts)
    .filter(([_, count]) => count > 0)
    .map(([sector, count]) => ({
      sector: sector as FacilitySector,
      name: language === "ar" 
        ? sectorLabels[sector as FacilitySector]?.ar || sector
        : sectorLabels[sector as FacilitySector]?.fr || sector,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <Card className="h-full border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-bold text-center">
          {t("Distribution par secteur", "التوزيع حسب القطاع")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            {t("Aucune donnée", "لا توجد بيانات")}
          </div>
        ) : (
          <div className="h-64 sm:h-72" style={{ direction: "ltr" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  domain={[0, maxCount]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                  width={75}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "hsl(var(--accent))" }}
                  formatter={(value: number) => [value, t("Établissements", "منشآت")]}
                />
                <Bar 
                  dataKey="count" 
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(var(--primary))`}
                      opacity={0.9 - (index * 0.03)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectorBarChart;
