import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusPieChartProps {
  active: number;
  inactive: number;
  pending: number;
  underConstruction: number;
}

const StatusPieChart = ({ active, inactive, pending, underConstruction }: StatusPieChartProps) => {
  const { t, language } = useLanguage();

  const data = [
    { name: t("Actif", "نشط"), value: active, color: "hsl(var(--success))" },
    { name: t("Inactif", "غير نشط"), value: inactive, color: "hsl(var(--critical))" },
    { name: t("En attente", "معلق"), value: pending, color: "hsl(var(--warning))" },
    { name: t("En construction", "قيد الإنشاء"), value: underConstruction, color: "hsl(var(--muted-foreground))" },
  ].filter(item => item.value > 0);

  const total = active + inactive + pending + underConstruction;

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="h-full border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg font-bold text-center">
          {t("Statut des établissements", "حالة المنشآت")}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {total === 0 ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            {t("Aucune donnée", "لا توجد بيانات")}
          </div>
        ) : (
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    direction: language === "ar" ? "rtl" : "ltr",
                  }}
                  formatter={(value: number, name: string) => [value, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{
                    fontSize: "12px",
                    direction: language === "ar" ? "rtl" : "ltr",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusPieChart;
