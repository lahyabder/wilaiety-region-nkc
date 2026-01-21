import { FileText, Scale, Users, AlertCircle, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <Link to="/" className="text-2xl font-bold">ولايتي - Wilaiety</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Scale className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">شروط الاستخدام</h1>
          <p className="text-muted-foreground">
            آخر تحديث: يناير 2024
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                مقدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                مرحباً بك في منصة <strong>ولايتي (Wilaiety)</strong>. باستخدامك لهذه المنصة، 
                فإنك توافق على الالتزام بهذه الشروط والأحكام.
              </p>
              <p className="text-muted-foreground">
                هذه المنصة مخصصة للمسؤولين والموظفين المعتمدين فقط لإدارة المرافق والجهات الحكومية.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                أهلية الاستخدام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li>• يجب أن تكون موظفاً أو مسؤولاً معتمداً للوصول إلى هذه المنصة</li>
                <li>• يتم إنشاء الحسابات من قبل مدير النظام فقط</li>
                <li>• أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك</li>
                <li>• يجب عدم مشاركة حسابك مع أي شخص آخر</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-primary" />
                الاستخدام المقبول
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>عند استخدام المنصة، يجب عليك:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ استخدام المنصة للأغراض المصرح بها فقط</li>
                <li>✓ توفير معلومات دقيقة وحديثة</li>
                <li>✓ الحفاظ على أمان حسابك</li>
                <li>✓ الامتثال لجميع القوانين واللوائح المعمول بها</li>
              </ul>
              <p className="font-medium text-critical">
                يُحظر: محاولة الوصول غير المصرح به، أو إساءة استخدام البيانات، أو أي نشاط ضار.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-primary" />
                المسؤولية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li>• نسعى لتوفير خدمة موثوقة ولكن لا نضمن التوفر الدائم</li>
                <li>• لسنا مسؤولين عن أي أضرار ناتجة عن سوء استخدام المنصة</li>
                <li>• نحتفظ بالحق في تعليق أو إنهاء الحسابات التي تنتهك هذه الشروط</li>
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
              <p className="mb-4">لأي استفسارات تتعلق بشروط الاستخدام:</p>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:support@wilaiety.com" className="text-primary hover:underline font-medium">
                  support@wilaiety.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center space-x-4 space-x-reverse">
          <Link to="/privacy-policy" className="text-primary hover:underline">
            سياسة الخصوصية
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

export default TermsPage;
