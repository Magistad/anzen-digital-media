/**
 * Lightweight budgets for the pages a buyer hits before checkout.
 * Scores are floors with room for CI noise. They fail on a real regression,
 * not on a few points of variance.
 */
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npx next start --hostname 127.0.0.1 --port 4173",
      startServerReadyPattern: "Ready",
      url: [
        "http://127.0.0.1:4173/",
        "http://127.0.0.1:4173/products/closepath",
        "http://127.0.0.1:4173/closepath/sign-in",
      ],
      numberOfRuns: 1,
      settings: {
        onlyCategories: ["performance", "accessibility"],
        chromeFlags: "--no-sandbox --disable-gpu --headless=new",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
