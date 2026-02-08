import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LanguageProvider } from "./contexts/LanguageContext";

import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  useEffect(() => {
    const siteName =
      (import.meta.env.VITE_SITE_NAME as string) || "المنصة الجهوية";
    const tagline =
      (import.meta.env.VITE_SITE_TAGLINE as string) ||
      "منصة إدارة المرافق والجهات";

    document.title = `${siteName} | ${tagline}`;
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* الصفحة الافتراضية */}
          <Route path="/" element={<Navigate to="/users" replace />} />

          {/* الصفحات */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/users" element={<UsersPage />} />

          {/* أي مسار غير معروف */}
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
