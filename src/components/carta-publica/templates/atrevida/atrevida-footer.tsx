import { getSocialLinks } from "@/lib/carta/social-links";
import type { RestaurantThemeRow } from "@/lib/types";

type AtrevidaFooterProps = {
  theme: RestaurantThemeRow;
};

export function AtrevidaFooter({ theme }: AtrevidaFooterProps) {
  const socialLinks = getSocialLinks(theme);

  return (
    <footer
      className="flex items-center justify-between border-t px-3 py-2"
      style={{
        backgroundColor: "var(--tab-bg)",
        borderColor: "var(--item-border)",
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
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--tab-active-bg)]"
              style={{
                borderColor: "var(--item-border)",
                color: "var(--footer-text)",
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
