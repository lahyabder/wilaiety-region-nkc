import { LucideIcon } from "lucide-react";

interface SectorCardProps {
  name: string;
  icon: LucideIcon;
  count: number;
  onClick?: () => void;
}

const SectorCard = ({ name, icon: Icon, count, onClick }: SectorCardProps) => {
  return (
    <button
      onClick={onClick}
      className="card-institutional hover:border-primary hover:shadow-md transition-all duration-200 text-right w-full group"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-accent group-hover:bg-primary/10 transition-colors">
          <Icon className="w-5 h-5 text-accent-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{name}</h3>
          <p className="text-muted-foreground text-sm">{count} منشأة</p>
        </div>
      </div>
    </button>
  );
};

export default SectorCard;
