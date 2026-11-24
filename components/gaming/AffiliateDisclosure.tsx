import { AFFILIATE_DISCLOSURE, AFFILIATE_PARTNERS } from "../../lib/gaming/affiliates";

export function AffiliateDisclosure() {
  return (
    <aside className="gaming-affiliates" aria-label="Store links and disclosure">
      <p>{AFFILIATE_DISCLOSURE}</p>
      <ul>
        {AFFILIATE_PARTNERS.map((partner) => (
          <li key={partner.id}>
            <a href={partner.href} rel="sponsored nofollow noopener" target="_blank">
              {partner.name}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
