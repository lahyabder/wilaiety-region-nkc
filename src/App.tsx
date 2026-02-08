import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";

function App() {
  useEffect(() => {
    const entityName = "جهة نواكشوط";
    document.title = `${entityName} | المنصة الجهوية`;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* الصفحة الرئيسية تذهب مباشرة إلى /users */}
        <Route path="/" element={<Navigate to="/users" replace />} />

        {/* صفحات التطبيق */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/users" element={<UsersPage />} />

        {/* أي رابط غير معروف */}
        <Route path="*" element={<Navigate to="/users" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
