"use client";

export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;   // closed → render nothing

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn"
      onClick={onClose}                      // backdrop click closes
    >
      <div
        className="w-full max-w-sm animate-slideUp"
        onClick={(e) => e.stopPropagation()} // clicks inside don't close
      >
        {children}
      </div>
    </div>
  );
}
