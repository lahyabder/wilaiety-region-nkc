import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  useEffect(() => {
    const siteName =
      (import.meta.env.VITE_SITE_NAME as string) || "المنصة الجهوية";
    const tagline =
      (import.meta.env.VITE_SITE_TAGLINE as string) || "منصة إدارة المرافق والجهات";

    // عنوان التبويب (Browser Tab)
    document.title = `${siteName} | ${tagline}`;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* الصفحة الافتراضية بعد الدخول/فتح الموقع */}
        <Route path="/" element={<Navigate to="/users" replace />} />

        {/* صفحاتك الحالية */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/users" element={<UsersPage />} />

        {/* أي مسار غير معروف يرجّعك للصفحة الافتراضية */}
        <Route path="*" element={<Navigate to="/users" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
