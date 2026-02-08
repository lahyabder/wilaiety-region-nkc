// src/App.tsx
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    // Site name from Vercel/Vite env
    const siteName =
      (import.meta.env.VITE_SITE_NAME as string) || "Wilaiety - ولايتي";

    // Optional: add a small suffix depending on route (clean + helpful)
    const path = location.pathname;
    const suffix =
      path.startsWith("/login")
        ? " | تسجيل الدخول"
        : path.startsWith("/users")
        ? " | المستخدمون"
        : "";

    document.title = `${siteName}${suffix}`;
  }, [location.pathname]);

  return (
    <Routes>
      {/* المطلوب: الصفحة الافتراضية تكون /users */}
      <Route path="/" element={<Navigate to="/users" replace />} />

      {/* Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/users" element={<UsersPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
}
