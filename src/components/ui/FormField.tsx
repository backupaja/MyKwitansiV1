/**
 * FormField — labelled input used in every modal form.
 * Consistent label style, input shape, spacing, and focus ring (via global CSS).
 *
 * The optional `error` prop renders an inline validation message below the input.
 */
export function FormField({
  label, type = "text", value, onChange, placeholder, error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Indonesian validation message shown below the input when set. */
  error?: string;
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-gray-50
          ${error ? "border-red-400 bg-red-50" : "border-gray-200"}`}
      />
      {error && (
        <p className="mt-1 text-xs font-medium" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}
    </div>
  );
}
