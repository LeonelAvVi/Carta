"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  inputName?: string;
  removeInputName?: string;
  currentImageUrl?: string | null;
  label?: string;
  hint?: string;
  error?: string;
};

export function ImageUploadField({
  inputName = "image",
  removeInputName = "removeImage",
  currentImageUrl,
  label = "Imagen",
  hint = "JPG, PNG, WebP o GIF · máx. 3 MB",
  error,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    setPreviewUrl(currentImageUrl ?? null);
    setRemoveImage(false);
  }, [currentImageUrl]);

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

    setRemoveImage(false);

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleRemove() {
    setRemoveImage(true);

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
        <label htmlFor={inputName} className="text-xs font-medium text-slate-600">
          {label}
        </label>
        <span className="text-xs text-slate-400">{hint}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50",
            !previewUrl && "text-xs text-slate-400"
          )}
        >
          {previewUrl && !removeImage ? (
            <Image
              src={previewUrl}
              alt="Vista previa"
              width={80}
              height={80}
              className="h-full w-full object-cover"
              unoptimized={previewUrl.startsWith("blob:")}
            />
          ) : (
            <span>Sin foto</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={inputName}
            name={inputName}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-slate-800"
          />

          {(previewUrl || currentImageUrl) && !removeImage ? (
            <button
              type="button"
              onClick={handleRemove}
              className="w-fit text-xs text-red-600 underline-offset-4 hover:underline"
            >
              Quitar imagen
            </button>
          ) : null}
        </div>
      </div>

      <input type="hidden" name={removeInputName} value={removeImage ? "true" : "false"} />

      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
