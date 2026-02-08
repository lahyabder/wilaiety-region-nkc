import { Bell, Menu, Search, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth, useProfile, useUserRole } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import { useSidebarContext } from "./Sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { siteConfig } from "../site.config";

const Header = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const { role } = useUserRole(user?.id);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const sidebarContext = useSidebarContext();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error(t("Échec de la déconnexion", "فشل تسجيل الخروج"));
    } else {
      toast.success(t("Déconnexion réussie", "تم تسجيل الخروج بنجاح"));
      navigate("/login");
    }
  };

  const handleMenuClick = () => {
    if (sidebarContext) {
      sidebarContext.setIsOpen(true);
    }
  };

  return (
    <header className="header-gradient sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Mobile Menu Button + Logo */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
              onClick={handleMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg sm:text-xl">و</span>
              </div>
              <div className="hidden xs:block">
                <h1 className="text-primary-foreground font-bold text-lg sm:text-xl">
                  {siteConfig.name}
                </h1>
                <p className="text-primary-foreground/80 text-[10px] sm:text-xs hidden sm:block">
                  {siteConfig.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Search - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/60" />
              <input
                type="text"
                placeholder={t("Rechercher des établissements...", "البحث عن المنشآت...")}
                className="w-full bg-primary-foreground/10 border-0 rounded-lg py-2 ps-10 pe-4 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageToggle />

            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10 w-8 h-8 sm:w-10 sm:h-10"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/10 w-8 h-8 sm:w-10 sm:h-10"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium truncate">
                      {profile?.full_name || user?.email}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {role === "admin"
                        ? t("Administrateur", "مدير")
                        : t("Utilisateur", "مستخدم")}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 me-2" />
                  {t("Déconnexion", "تسجيل الخروج")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
