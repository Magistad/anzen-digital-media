import { DeskCard } from "../desk/DeskCard";
import { GAMING_SECTIONS } from "../../lib/gaming/sections";
import { listPostsInSection, type GamingPostMeta } from "../../lib/gaming/posts";

export function SectionDirectory({ postsBySection }: { postsBySection?: Record<string, GamingPostMeta[]> }) {
  return (
    <nav aria-label="Gaming sections">
      <ul className="desk-grid">
        {GAMING_SECTIONS.map((section) => {
          const posts = postsBySection?.[section.slug] ?? listPostsInSection(section.slug);
          const published = posts.filter((post) => !post.draft).length;
          const drafts = posts.filter((post) => post.draft).length;
          const state =
            published > 0
              ? published === 1
                ? "1 piece"
                : `${published} pieces`
              : drafts > 0
                ? drafts === 1
                  ? "1 draft, preview only"
                  : `${drafts} drafts, preview only`
                : "Nothing published yet";
          return (
            <li key={section.slug}>
              <DeskCard href={section.href} kicker="Gaming" title={section.name} detail={section.summary} meta={state} />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
