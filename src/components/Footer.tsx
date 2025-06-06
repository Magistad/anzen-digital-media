/* ----------------------------------------------------------------
   Footer – 8-category grid, white text, flush with hero section
   ---------------------------------------------------------------- */
const categories = [
  { en: 'Generative Content',   jp: '生成系' },
  { en: 'Workflow & Automation', jp: '業務自動化' },
  { en: 'Dev Tools & APIs',     jp: '開発者ツール' },
  { en: 'Customer Support',     jp: 'カスタマーサポート' },
  { en: 'Marketing AI',         jp: 'マーケティング' },
  { en: 'Data & BI',            jp: 'データ分析' },
  { en: 'Creative (Media)',     jp: 'クリエイティブ' },
  { en: 'Voice & NLP',          jp: '音声・言語' },
];

export default function Footer() {
  return (
    <footer className="bg-black py-8 text-white">
      <ul className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl mx-auto text-sm">
        {categories.map(({ en, jp }) => (
          <li key={en} className="group">
            <span className="block font-medium group-hover:text-[--hinomaru]">
              {en}
            </span>
            <span className="text-xs opacity-70">{jp}</span>
          </li>
        ))}
      </ul>
    </footer>
  );
}
