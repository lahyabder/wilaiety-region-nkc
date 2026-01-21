import { Shield, Mail, AlertTriangle, CreditCard, Lock, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const SecurityPage = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <Link to="/" className="text-2xl font-bold">ولايتي - Wilaiety</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">الأمان والثقة</h1>
          <p className="text-muted-foreground text-lg">
            معلومات مهمة حول أمان منصة ولايتي
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                ما هي منصة ولايتي؟
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                منصة <strong>ولايتي (Wilaiety)</strong> هي منصة رسمية لإدارة المرافق والجهات الحكومية. 
                هذا الموقع مخصص للمسؤولين والموظفين المعتمدين فقط.
              </p>
              <p className="text-muted-foreground">
                Wilaiety is an official facilities management platform for government entities. 
                This site is for authorized administrators only.
              </p>
            </CardContent>
          </Card>

          <Card className="border-success/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-success">
                <CreditCard className="w-6 h-6" />
                لا نجمع معلومات مالية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                  <span><strong>لا نطلب معلومات بطاقات الائتمان أو الخصم</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                  <span><strong>لا نجمع أي مدفوعات عبر هذا الموقع</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                  <span><strong>لا نطلب معلومات حسابك البنكي</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                  <span><strong>لا نطلب رقم الهوية أو جواز السفر</strong></span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                أمان كلمة المرور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>نطلب فقط <strong>البريد الإلكتروني وكلمة المرور</strong> لتسجيل الدخول</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>لا نطلب منك إعادة استخدام كلمات مرور من مواقع أخرى</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>استخدم كلمة مرور فريدة وقوية لهذا الموقع</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                الإبلاغ عن مشاكل أمنية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                إذا اكتشفت أي مشكلة أمنية أو نشاط مشبوه، يرجى التواصل معنا:
              </p>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:security@wilaiety.com" className="text-primary hover:underline font-medium">
                  security@wilaiety.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-primary" />
                التحقق من صحة الموقع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                للتحقق من أنك على الموقع الرسمي:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>✓ تأكد من أن عنوان URL هو: <code className="bg-muted px-2 py-1 rounded">wilaiety.com</code></li>
                <li>✓ تأكد من وجود قفل الأمان (HTTPS) في شريط العنوان</li>
                <li>✓ لا تدخل معلوماتك على أي موقع مشابه</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-primary hover:underline">
            العودة للصفحة الرئيسية
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

export default SecurityPage;
