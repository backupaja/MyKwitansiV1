/**
 * Modal dialog — consistent overlay, panel shape, header, and close button.
 * `wide` switches between form width (max-w-lg) and preview width (max-w-2xl).
 */
export function Modal({
  title, onClose, children, wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full modal-enter
          ${wide ? "max-w-2xl" : "max-w-lg"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg leading-none
              text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
