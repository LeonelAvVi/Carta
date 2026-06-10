import { getSocialLinks } from "@/lib/carta/social-links";
import type { RestaurantRow, RestaurantThemeRow } from "@/lib/types";

type CasualFooterProps = {
  restaurant: RestaurantRow;
  theme: RestaurantThemeRow;
};

export function CasualFooter({ theme }: CasualFooterProps) {
  const socialLinks = getSocialLinks(theme);

  return (
    <footer
      className="flex items-center justify-between border-t px-4 py-2"
      style={{
        backgroundColor: "var(--footer-bg)",
        borderColor: "var(--category-container-border)",
      }}
    >
      {socialLinks.length > 0 ? (
        <div className="flex gap-1.5">
          {socialLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={link.label}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--social-icon-color)]"
              style={{
                backgroundColor: "var(--social-icon-bg)",
                color: "var(--social-icon-color)",
              }}
            >
              {link.icon}
            </a>
          ))}
        </div>
      ) : (
        <span />
      )}

      <p className="text-[9px]" style={{ color: "var(--footer-text)" }}>
        TuCarta
        <span className="font-semibold" style={{ color: "var(--tab-active-bg)" }}>
          .bo
        </span>
      </p>
    </footer>
  );
}
