import { Mail, Phone, MapPin, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <Link to="/" className="text-2xl font-bold">ولايتي - Wilaiety</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Mail className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">تواصل معنا</h1>
          <p className="text-muted-foreground text-lg">
            نحن هنا للمساعدة. تواصل معنا عبر أي من القنوات التالية.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                البريد الإلكتروني
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الدعم الفني:</p>
                  <a href="mailto:support@wilaiety.com" className="text-primary hover:underline font-medium">
                    support@wilaiety.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">استفسارات عامة:</p>
                  <a href="mailto:info@wilaiety.com" className="text-primary hover:underline font-medium">
                    info@wilaiety.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">الأمان:</p>
                  <a href="mailto:security@wilaiety.com" className="text-primary hover:underline font-medium">
                    security@wilaiety.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Phone className="w-6 h-6 text-primary" />
                الهاتف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">رقم الهاتف:</p>
                  <p className="font-medium" dir="ltr">+222 XX XX XX XX</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>الأحد - الخميس: 8:00 ص - 4:00 م</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                العنوان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                نواذيبو، موريتانيا
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Nouadhibou, Mauritania
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                الإبلاغ عن مشاكل أمنية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                إذا اكتشفت أي مشكلة أمنية، يرجى التواصل فوراً:
              </p>
              <a href="mailto:security@wilaiety.com" className="text-primary hover:underline font-medium">
                security@wilaiety.com
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardContent className="py-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">ملاحظة مهمة</h3>
              <p className="text-muted-foreground">
                هذه المنصة مخصصة للمسؤولين المعتمدين فقط. للحصول على حساب، 
                يرجى التواصل مع مدير النظام في مؤسستك.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center space-x-4 space-x-reverse">
          <Link to="/privacy-policy" className="text-primary hover:underline">
            سياسة الخصوصية
          </Link>
          <span className="text-muted-foreground">|</span>
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

export default ContactPage;
