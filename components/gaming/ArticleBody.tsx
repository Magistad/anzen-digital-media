import { compileMDX } from "next-mdx-remote/rsc";
import { AffiliateDisclosure } from "./AffiliateDisclosure";
import { HotOrNot } from "./HotOrNot";
import { LootCall } from "./LootCall";

const components = {
  LootCall,
  HotOrNot,
  AffiliateDisclosure,
};

export async function ArticleBody({ source }: { source: string }) {
  const { content } = await compileMDX({
    source,
    components,
    options: { parseFrontmatter: false },
  });
  return <div className="gaming-prose">{content}</div>;
}
