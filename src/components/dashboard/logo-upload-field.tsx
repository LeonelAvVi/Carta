"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type LogoUploadFieldProps = {
  currentLogoUrl?: string | null;
  error?: string;
};

export function LogoUploadField({ currentLogoUrl, error }: LogoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl ?? null);
  const [removeLogo, setRemoveLogo] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentLogoUrl ?? null);
    setRemoveLogo(false);
  }, [currentLogoUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setRemoveLogo(false);

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemove() {
    setRemoveLogo(true);

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="logo" className="text-sm font-medium text-slate-700">
          Logo del restaurante
        </label>
        <span className="text-xs text-slate-500">JPG, PNG, WebP o GIF · máx. 2 MB</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className={cn(
            "flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50",
            !previewUrl && "text-xs text-slate-400"
          )}
        >
          {previewUrl && !removeLogo ? (
            <Image
              src={previewUrl}
              alt="Vista previa del logo"
              width={96}
              height={96}
              className="h-full w-full object-cover"
              unoptimized={previewUrl.startsWith("blob:")}
            />
          ) : (
            <span>Sin logo</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id="logo"
            name="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
          />

          {(previewUrl || currentLogoUrl) && !removeLogo ? (
            <button
              type="button"
              onClick={handleRemove}
              className="w-fit text-sm text-red-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Quitar logo
            </button>
          ) : null}
        </div>
      </div>

      <input type="hidden" name="removeLogo" value={removeLogo ? "true" : "false"} />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          El logo aparecerá en tu carta pública y en el panel.
        </p>
      )}
    </div>
  );
}
