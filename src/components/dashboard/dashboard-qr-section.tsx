"use client";

import { Download, Link2, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import {
  getTableCartaUrl,
  isDeliveryTableSlug,
} from "@/lib/carta/table-urls";
import type { TableRow } from "@/lib/types";
import { cn } from "@/lib/utils";

type DashboardQrSectionProps = {
  restaurantSlug: string;
  restaurantName: string;
  tables: TableRow[];
  generalUrl: string;
  deliveryUrl: string;
  appBaseUrl: string;
};

function useQrDataUrl(url: string | null) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setDataUrl(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setError(null);

    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: { dark: "#111827", light: "#FFFFFF" },
      errorCorrectionLevel: "M",
    })
      .then((result) => {
        if (!cancelled) setDataUrl(result);
      })
      .catch((err: unknown) => {
        console.error("QR generate:", err);
        if (!cancelled) {
          setDataUrl(null);
          setError("No se pudo generar el QR");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { dataUrl, error };
}

function QrPreview({
  title,
  description,
  url,
  dataUrl,
  error,
  filename,
  emptyHint,
}: {
  title: string;
  description: string;
  url: string | null;
  dataUrl: string | null;
  error: string | null;
  filename: string;
  emptyHint?: string;
}) {
  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm shadow-brand-purple/5">
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
          <QrCode className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="text-base font-semibold text-brand">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-brand-purple/20 bg-[#F7F5FF] p-4">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={`Código QR: ${title}`}
            className="h-[180px] w-[180px] rounded-lg bg-white p-2 shadow-sm"
          />
        ) : (
          <div className="flex h-[180px] w-[180px] items-center justify-center rounded-lg bg-white/70 p-4 text-center text-xs text-slate-500">
            {error ?? emptyHint ?? "El QR aparecerá aquí"}
          </div>
        )}
      </div>

      {url ? (
        <p className="mt-3 break-all text-center text-[11px] text-slate-500">{url}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!dataUrl}
          onClick={download}
          className={cn(
            "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors",
            dataUrl
              ? "bg-brand-purple text-white hover:bg-brand-purple-hover"
              : "cursor-not-allowed bg-slate-100 text-slate-400"
          )}
        >
          <Download className="h-4 w-4" />
          Descargar
        </button>
        <button
          type="button"
          disabled={!url}
          onClick={copy}
          className={cn(
            "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border text-sm font-semibold transition-colors",
            url
              ? "border-brand-purple/25 text-brand-purple hover:bg-brand-purple/10"
              : "cursor-not-allowed border-slate-200 text-slate-400"
          )}
        >
          <Link2 className="h-4 w-4" />
          Copiar enlace
        </button>
      </div>
    </div>
  );
}

export function DashboardQrSection({
  restaurantSlug,
  restaurantName,
  tables,
  generalUrl,
  deliveryUrl,
  appBaseUrl,
}: DashboardQrSectionProps) {
  const dineInTables = useMemo(
    () => tables.filter((t) => t.is_active && !isDeliveryTableSlug(t.slug)),
    [tables]
  );

  const [selectedTableSlug, setSelectedTableSlug] = useState("");
  const [originBase, setOriginBase] = useState(appBaseUrl);

  // En el navegador, si el server no trajo base, usamos el dominio actual (localhost, etc.).
  useEffect(() => {
    if (!originBase && typeof window !== "undefined") {
      setOriginBase(window.location.origin);
    }
  }, [originBase]);

  const resolvedGeneralUrl = useMemo(() => {
    if (/^https?:\/\//i.test(generalUrl)) return generalUrl;
    const base = originBase || (typeof window !== "undefined" ? window.location.origin : "");
    return base ? `${base}${generalUrl}` : generalUrl;
  }, [generalUrl, originBase]);

  const resolvedDeliveryUrl = useMemo(() => {
    if (/^https?:\/\//i.test(deliveryUrl)) return deliveryUrl;
    const base = originBase || (typeof window !== "undefined" ? window.location.origin : "");
    return base ? `${base}${deliveryUrl}` : deliveryUrl;
  }, [deliveryUrl, originBase]);

  const tableUrl = selectedTableSlug
    ? getTableCartaUrl(restaurantSlug, selectedTableSlug, originBase)
    : null;

  const generalQr = useQrDataUrl(resolvedGeneralUrl);
  const tableQr = useQrDataUrl(tableUrl);
  const deliveryQr = useQrDataUrl(resolvedDeliveryUrl);

  const selectedTable = dineInTables.find((t) => t.slug === selectedTableSlug);

  return (
    <section className="rounded-2xl border border-brand-purple/10 bg-white p-6 shadow-sm shadow-brand-purple/5 sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-purple">
          Códigos QR
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-brand">
          Comparte tu carta
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Generá e imprimí el QR del menú general, de cada mesa o de delivery para{" "}
          {restaurantName}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <QrPreview
          title="Menú general"
          description="Para vitrina, redes o entrada. Solo muestra la carta (sin mesa)."
          url={resolvedGeneralUrl}
          dataUrl={generalQr.dataUrl}
          error={generalQr.error}
          filename={`${restaurantSlug}-menu-general.png`}
        />

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-brand-purple/10 bg-white p-5 shadow-sm shadow-brand-purple/5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <label
              htmlFor="qr-table-select"
              className="mb-2 block text-sm font-semibold text-brand"
            >
              Mesa para el QR
            </label>
            <select
              id="qr-table-select"
              value={selectedTableSlug}
              onChange={(e) => setSelectedTableSlug(e.target.value)}
              className="h-11 w-full rounded-xl border border-brand-purple/20 bg-white px-3 text-sm text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2"
            >
              <option value="">Elegí una mesa…</option>
              {dineInTables.map((table) => (
                <option key={table.id} value={table.slug}>
                  {table.name}
                </option>
              ))}
            </select>
            {dineInTables.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Todavía no tenés mesas. Creá una en{" "}
                <a
                  href="/dashboard/mesas"
                  className="font-semibold text-brand-purple underline-offset-2 hover:underline"
                >
                  Mesas
                </a>
                .
              </p>
            ) : null}
          </div>

          <QrPreview
            title="QR por mesa"
            description="El comensal escanea y pide vinculado a esa mesa."
            url={tableUrl}
            dataUrl={tableQr.dataUrl}
            error={tableQr.error}
            filename={`${restaurantSlug}-${selectedTableSlug || "mesa"}.png`}
            emptyHint="Elegí una mesa para generar el QR"
          />
          {selectedTable ? (
            <p className="text-center text-xs font-medium text-brand-purple">
              Seleccionada: {selectedTable.name}
            </p>
          ) : null}
        </div>

        <QrPreview
          title="QR Delivery"
          description="Para delivery o takeaway. Los pedidos aparecen como “Delivery”."
          url={resolvedDeliveryUrl}
          dataUrl={deliveryQr.dataUrl}
          error={deliveryQr.error}
          filename={`${restaurantSlug}-delivery.png`}
        />
      </div>
    </section>
  );
}
