/**
 * IndexNow — instant push notification of new/updated URLs to Bing, Yandex,
 * DuckDuckGo, Seznam (and via Bing, Google-Extended crawlers discover faster).
 *
 * Key file is at /public/<key>.txt so https://valueswitch.co.uk/<key>.txt
 * returns that exact key — proving we own the submitter identity.
 *
 * Usage:
 *   await pingIndexNow(["https://valueswitch.co.uk/guides/..."])
 */

export const INDEXNOW_KEY = "a6e97298b4d9ff429677f7c7248cc986";
const HOST = "valueswitch.co.uk";
const SITE = "https://valueswitch.co.uk";

export async function pingIndexNow(urls: string[]): Promise<boolean> {
  if (urls.length === 0) return true;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
    // 200 = accepted, 202 = accepted (async), 422 = URL doesn't match host
    return res.status === 200 || res.status === 202;
  } catch (err) {
    console.error("[indexnow] ping failed:", err);
    return false;
  }
}
