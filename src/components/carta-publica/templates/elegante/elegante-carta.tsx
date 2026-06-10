import { CartaFooter } from "@/components/carta-publica/carta-footer";
import { CartaHeader } from "@/components/carta-publica/carta-header";
import { CartaMenu } from "@/components/carta-publica/carta-menu";
import type { CartaTemplateProps } from "@/lib/carta/template-types";

export function EleganteCarta({ restaurant, theme, sections }: CartaTemplateProps) {
  return (
    <>
      <main>
        <CartaHeader restaurant={restaurant} theme={theme} />
        <CartaMenu sections={sections} theme={theme} />
      </main>
      <CartaFooter restaurant={restaurant} theme={theme} />
    </>
  );
}
