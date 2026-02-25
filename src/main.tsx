import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getExternalBrowserUrl, isInAppWebView } from "@/lib/webview";

function forceOpenInExternalBrowser(): boolean {
  if (!isInAppWebView()) return false;

  const targetUrl = getExternalBrowserUrl(window.location.href);

  // Android LINE: use intent URL to force Chrome external open.
  if (targetUrl.startsWith("intent://")) {
    window.location.href = targetUrl;
    return true;
  }

  // iOS / other in-app browsers: try opening a new external tab first.
  const opened = window.open(targetUrl, "_blank");
  if (!opened) {
    window.location.href = targetUrl;
  }

  return true;
}

const redirected = forceOpenInExternalBrowser();

if (!redirected) {
  createRoot(document.getElementById("root")!).render(<App />);
}
