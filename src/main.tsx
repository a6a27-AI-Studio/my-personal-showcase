import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useState } from "react";
import App from "./App.tsx";
import "./index.css";
import { getExternalBrowserUrl, isInAppWebView } from "@/lib/webview";

function WebViewRedirectPage() {
  const targetUrl = useMemo(() => getExternalBrowserUrl(window.location.href), []);
  const [status, setStatus] = useState("正在開啟外部瀏覽器...");

  useEffect(() => {
    if (targetUrl.startsWith("intent://")) {
      window.location.href = targetUrl;
      return;
    }

    const opened = window.open(targetUrl, "_blank");
    if (!opened) {
      setStatus("無法自動開啟，請點下方按鈕在外部瀏覽器開啟。");
    } else {
      setStatus("已嘗試開啟外部瀏覽器，若未跳轉請點下方按鈕。");
    }

    const timer = window.setTimeout(() => {
      window.location.href = targetUrl;
    }, 700);

    return () => window.clearTimeout(timer);
  }, [targetUrl]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 420 }}>
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>正在切換到外部瀏覽器</h1>
        <p style={{ color: "#666", marginBottom: 16 }}>{status}</p>
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            background: "#111",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 14,
          }}
        >
          立即在瀏覽器開啟
        </a>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(isInAppWebView() ? <WebViewRedirectPage /> : <App />);
