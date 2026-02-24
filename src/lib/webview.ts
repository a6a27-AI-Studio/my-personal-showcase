export function isInAppWebView(userAgent = navigator.userAgent): boolean {
  const ua = userAgent.toLowerCase();
  return (
    ua.includes(' line/') ||
    ua.includes(' liff') ||
    ua.includes('fban') ||
    ua.includes('fbav') ||
    ua.includes('instagram') ||
    ua.includes('micromessenger')
  );
}

export function getExternalBrowserUrl(currentUrl = window.location.href, userAgent = navigator.userAgent): string {
  const ua = userAgent.toLowerCase();
  const isAndroid = ua.includes('android');
  const isLine = ua.includes(' line/') || ua.includes(' liff');

  if (isAndroid && isLine) {
    const noProto = currentUrl.replace(/^https?:\/\//, '');
    return `intent://${noProto}#Intent;scheme=https;package=com.android.chrome;end`;
  }

  return currentUrl;
}
