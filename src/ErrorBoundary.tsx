import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // You can add logging here later if needed
    // console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            maxWidth: 900,
            margin: "40px auto",
            padding: 16,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
          }}
        >
          <div
            style={{
              border: "1px solid #ef4444",
              background: "#fff5f5",
              padding: 16,
              borderRadius: 12,
            }}
          >
            <h2 style={{ margin: 0, marginBottom: 8 }}>حدث خطأ داخل التطبيق</h2>
            <p style={{ marginTop: 0, marginBottom: 12, color: "#111827" }}>
              بدل صفحة بيضاء، هذا هو الخطأ الذي أوقف العرض:
            </p>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "white",
                border: "1px solid #e5e7eb",
                padding: 12,
                borderRadius: 8,
                color: "#111827",
              }}
            >
              {this.state.error?.message || "Unknown error"}
            </pre>

            <p style={{ marginBottom: 0, color: "#374151" }}>
              افتح Console في المتصفح لعرض تفاصيل أوسع (stack trace).
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
