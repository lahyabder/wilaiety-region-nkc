import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";

function App() {
  useEffect(() => {
    // اسم الجهة يمكن تغييره لاحقًا من ENV أو API
    const entityName = "جهة نواكشوط";
    document.title = `${entityName} | المنصة الجهوية`;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ اجعل الصفحة الرئيسية تذهب مباشرة لتسجيل الدخول */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* صفحاتك الحالية */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/users" element={<UsersPage />} />

        {/* ✅ أي رابط غير معروف يذهب لتسجيل الدخول بدل صفحة بيضاء */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
