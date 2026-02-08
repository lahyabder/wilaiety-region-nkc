import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const siteName = (import.meta.env.VITE_SITE_NAME as string) || "المنصة الجهوية";

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
      {/* المطلوب: الصفحة الافتراضية */}
      <Route path="/" element={<Navigate to="/users" replace />} />

      {/* صفحات */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/users" element={<UsersPage />} />

      {/* أي مسار غير معروف يرجع إلى /users */}
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
}
