import { redirect } from "next/navigation";

type MenuRedirectPageProps = {
  params: { slug: string };
  searchParams?: { table?: string; preview?: string };
};

/** Alias de /carta/[slug] — útil para QR con ruta /menu/ */
export default function MenuRedirectPage({
  params,
  searchParams,
}: MenuRedirectPageProps) {
  const qs = new URLSearchParams();
  if (searchParams?.table) qs.set("table", searchParams.table);
  if (searchParams?.preview) qs.set("preview", searchParams.preview);

  const query = qs.toString();
  redirect(`/carta/${params.slug}${query ? `?${query}` : ""}`);
}
