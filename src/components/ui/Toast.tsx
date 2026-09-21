import { tokens } from "../../styles/tokens";
import { Ico } from "../../utils/icons";

/** Floating success toast. Renders nothing when message is empty. */
export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="toast-enter z-[60]">
      <div
        className="bg-white border border-gray-200 shadow-lg rounded-xl px-5 py-3
          flex items-center gap-2.5 text-sm font-medium text-gray-700 whitespace-nowrap"
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
          style={{ background: tokens.color.success }}
        >
          {Ico.check()}
        </span>
        {message}
      </div>
    </div>
  );
}
