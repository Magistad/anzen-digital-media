#!/usr/bin/env node
/**
 * Tells Bing (and other IndexNow engines such as Yandex, Naver, Seznam) that
 * URLs on anzendigitalmedia.com are new or changed. Run it by hand AFTER a
 * deploy that Javier approved. It does nothing on build.
 *
 *   node scripts/indexnow.mjs                 # every URL in the live sitemap
 *   node scripts/indexnow.mjs /gaming/some-post /gaming/tips
 *
 * The key is public by design: IndexNow checks it at /<key>.txt.
 * Google does not use IndexNow. Use Search Console for Google.
 */
const HOST = "anzendigitalmedia.com";
const KEY = "ed2e96d57946022c757fd2018f799f0c";
const ORIGIN = `https://${HOST}`;

async function sitemapUrls() {
  const res = await fetch(`${ORIGIN}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const args = process.argv.slice(2);
const urlList = args.length ? args.map((p) => new URL(p, ORIGIN).toString()) : await sitemapUrls();

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow ${res.status} for ${urlList.length} URL(s)`);
if (res.status >= 400) process.exitCode = 1;
