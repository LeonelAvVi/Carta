import { cn } from "@/lib/utils";

type AuthFieldProps = {
  id: string;
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

export function AuthField({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  required,
  error,
  defaultValue,
  onChange,
}: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900",
          "placeholder:text-slate-400",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
