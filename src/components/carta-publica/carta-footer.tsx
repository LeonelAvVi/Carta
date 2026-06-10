import { getSocialLinks } from "@/lib/carta/social-links";
import type { RestaurantRow, RestaurantThemeRow } from "@/lib/types";

type CartaFooterProps = {
  restaurant: RestaurantRow;
  theme: RestaurantThemeRow;
};

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--social-icon-color)] focus-visible:ring-offset-2 active:scale-[0.98] motion-safe:duration-150"
      style={{
        backgroundColor: "var(--social-icon-bg)",
        color: "var(--social-icon-color)",
      }}
    >
      {children}
    </a>
  );
}

export function CartaFooter({ restaurant, theme }: CartaFooterProps) {
  const socialLinks = getSocialLinks(theme);

  return (
    <footer
      className="mx-auto max-w-lg border-t px-4 py-8 text-center text-sm"
      style={{
        backgroundColor: "var(--footer-bg)",
        color: "var(--footer-text)",
        borderColor: "var(--category-container-border)",
      }}
    >
      {socialLinks.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
          {socialLinks.map((link) => (
            <SocialLink key={link.key} href={link.href} label={link.label}>
              <span className="text-xs font-semibold">{link.icon}</span>
            </SocialLink>
          ))}
        </div>
      ) : null}

      {theme.show_address && restaurant.address ? (
        <p className="mb-2">
          <span aria-hidden className="mr-1">
            📍
          </span>
          {restaurant.address}
        </p>
      ) : null}

      {theme.show_phone && restaurant.phone ? (
        <p className="mb-4">
          <span aria-hidden className="mr-1">
            📞
          </span>
          <a
            href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
            className="underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--social-icon-color)] focus-visible:ring-offset-2"
          >
            {restaurant.phone}
          </a>
        </p>
      ) : null}

      <p>
        Carta digital por{" "}
        <span className="font-semibold" style={{ color: "var(--tab-active-bg)" }}>
          TuCarta.bo
        </span>
      </p>
    </footer>
  );
}
