import React, { useId, useState } from "react";
export type InputSpec = {
  name: string;
  label: string;
  options?: { value: string; label: string }[];
  multiline?: boolean;
  optional?: boolean;
  value?: string;
  type?: string;
};
export const control =
  "w-full rounded-[4px] border border-[#cfcddb] bg-white px-2 py-1.5 text-[12px] text-[#262337] focus:outline-none focus:ring-1 focus:ring-[#6f6c96]";
export const button =
  "rounded-[4px] border border-[#cfcddb] bg-[#eeedf5] px-3 py-1.5 text-[12px] font-semibold hover:bg-[#dfdceb] disabled:opacity-40 disabled:cursor-not-allowed";
export function Form({
  title,
  fields,
  submit,
  onSubmit,
}: {
  title: string;
  fields: InputSpec[];
  submit: string;
  onSubmit: (v: Record<string, string>) => Promise<unknown>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const formId = useId();
  return (
    <form
      aria-label={title}
      className="rounded-[4px] border border-[#cfcddb] bg-white p-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const values = Object.fromEntries(
          new FormData(form).entries(),
        ) as Record<string, string>;
        setBusy(true);
        setError("");
        setDone(false);
        try {
          await onSubmit(values);
          setDone(true);
          form.reset();
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3 className="text-[13px] font-bold text-[#423f5c]">{title}</h3>
      {fields.map((f) => (
        <div
          key={f.name}
          className="block text-[11px] font-medium text-[#55516b]"
        >
          <label htmlFor={`${formId}-${f.name}`}>{f.label}</label>
          {f.options ? (
            <select
              id={`${formId}-${f.name}`}
              aria-label={f.label}
              className={control}
              name={f.name}
              defaultValue={f.value || ""}
              required={!f.optional}
            >
              <option value="">{f.optional ? "None" : "Choose…"}</option>
              {f.options.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </select>
          ) : f.multiline ? (
            <textarea
              id={`${formId}-${f.name}`}
              aria-label={f.label}
              className={`${control} min-h-20`}
              name={f.name}
              defaultValue={f.value}
              required={!f.optional}
            />
          ) : (
            <input
              id={`${formId}-${f.name}`}
              aria-label={f.label}
              className={control}
              name={f.name}
              type={f.type || "text"}
              defaultValue={f.value}
              required={!f.optional}
            />
          )}
        </div>
      ))}
      <button className={button} disabled={busy} type="submit">
        {busy ? "Saving…" : submit}
      </button>
      {error && (
        <p role="alert" className="text-[12px] text-red-800">
          {error}
        </p>
      )}
      {done && (
        <p role="status" className="text-[12px] text-emerald-800">
          Saved.
        </p>
      )}
    </form>
  );
}
export function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-[#cfcddb] rounded-[4px] bg-white p-4 space-y-3">
      <h3 className="text-[13px] font-bold text-[#423f5c]">{title}</h3>
      {children}
    </section>
  );
}
export const option = (value: string, label = value) => ({ value, label });
export const priorities = ["Critical", "High", "Priority", "Routine"].map((x) =>
  option(x),
);
