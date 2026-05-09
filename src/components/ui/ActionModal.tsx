"use client";

type ActionModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  dark: boolean;
  children: React.ReactNode;
};

export default function ActionModal({
  open,
  title,
  onClose,
  dark,
  children,
}: ActionModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog backdrop"
      />
      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
          dark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md border ${
              dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            Close
          </button>
        </div>
        <div className="space-y-3 text-sm">{children}</div>
      </div>
    </div>
  );
}
