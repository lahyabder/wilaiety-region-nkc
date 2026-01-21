import { Shield, FileText, Eye, Lock, Database, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <Link to="/" className="text-2xl font-bold">ولايتي - Wilaiety</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <FileText className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">سياسة الخصوصية</h1>
          <p className="text-muted-foreground">
            آخر تحديث: يناير 2024
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                المعلومات التي نجمعها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>نجمع فقط المعلومات الضرورية لتشغيل المنصة:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>البريد الإلكتروني (للمستخدمين المعتمدين فقط)</li>
                <li>الاسم الكامل</li>
                <li>معلومات المرافق والجهات التي تديرها</li>
              </ul>
              <p className="font-medium text-success">
                لا نجمع: معلومات بطاقات الائتمان، أرقام الهوية، أو أي معلومات مالية.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                كيف نستخدم معلوماتك
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li>✓ تمكينك من الوصول إلى المنصة وإدارة المرافق</li>
                <li>✓ التواصل معك بشأن حسابك</li>
                <li>✓ تحسين خدماتنا وتجربة المستخدم</li>
                <li>✓ الامتثال للمتطلبات القانونية</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Database className="w-6 h-6 text-primary" />
                حماية البيانات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>نحمي بياناتك من خلال:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• تشفير SSL/TLS لجميع الاتصالات</li>
                <li>• تخزين آمن للبيانات</li>
                <li>• وصول محدود للموظفين المعتمدين فقط</li>
                <li>• مراجعات أمنية دورية</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                حقوقك
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>• الوصول إلى بياناتك الشخصية</li>
                <li>• تصحيح البيانات غير الدقيقة</li>
                <li>• طلب حذف حسابك</li>
                <li>• الاعتراض على معالجة بياناتك</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                تواصل معنا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">لأي استفسارات تتعلق بالخصوصية:</p>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:privacy@wilaiety.com" className="text-primary hover:underline font-medium">
                  privacy@wilaiety.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center space-x-4 space-x-reverse">
          <Link to="/terms" className="text-primary hover:underline">
            شروط الاستخدام
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link to="/security" className="text-primary hover:underline">
            الأمان
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link to="/" className="text-primary hover:underline">
            الصفحة الرئيسية
          </Link>
        </div>
      </main>

      <footer className="bg-muted/50 border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 ولايتي - Wilaiety. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;
