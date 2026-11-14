/**
 * Lightweight budgets for the pages a buyer hits before checkout.
 * Scores are floors. One Lighthouse run moves a few points between CI machines,
 * so the median of three runs is what has to clear the floor.
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
      numberOfRuns: 3,
      settings: {
        onlyCategories: ["performance", "accessibility"],
        chromeFlags: "--no-sandbox --disable-gpu --headless=new",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.8, aggregationMethod: "median" }],
        "categories:accessibility": ["error", { minScore: 0.9, aggregationMethod: "median" }],
        "largest-contentful-paint": ["error", { maxNumericValue: 4000, aggregationMethod: "median" }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1, aggregationMethod: "median" }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
