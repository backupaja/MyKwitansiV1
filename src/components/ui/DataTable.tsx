import { tokens } from "../../styles/tokens";
import { Ico } from "../../utils/icons";

const { color } = tokens;

// ── Table header cell ─────────────────────────────────────────────────────

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
      {children} {Ico.sort()}
    </th>
  );
}

// ── Table data cell ───────────────────────────────────────────────────────

export function Td({
  children,
  accent = false,
  mono = false,
}: {
  children: React.ReactNode;
  /** Render in brand colour with semibold weight (e.g. admin name). */
  accent?: boolean;
  /** Apply tabular-nums for numbers and currencies. */
  mono?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3.5 text-sm whitespace-nowrap
        ${accent ? "font-semibold" : "font-normal text-gray-700"}
        ${mono ? "tabular-nums" : ""}`}
      style={accent ? { color: color.brand } : undefined}
    >
      {children}
    </td>
  );
}

// ── Show-entries select + search input ────────────────────────────────────

export function TableControls({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Tampilkan</span>
        <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white text-gray-700 font-medium">
          <option>10</option>
          <option>25</option>
          <option>50</option>
        </select>
        <span>data</span>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {Ico.search()}
        </span>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Cari…"
          className="border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm w-48 bg-white text-gray-700"
        />
      </div>
    </>
  );
}

// ── Card toolbar row (buttons left, controls right) ───────────────────────

export function CardToolbar({
  left,
  right,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-50">
      <div className="flex items-center gap-2">{left}</div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}

// ── Full data table with header and footer count ──────────────────────────

export function DataTable({
  headers,
  children,
  shownEntries,
  totalEntries,
}: {
  headers: string[];
  children: React.ReactNode;
  shownEntries: number;
  totalEntries: number;
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3 w-10" />
              {headers.map((h) => (
                <Th key={h}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">{children}</tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-4 px-1">
        Menampilkan{" "}
        <span className="font-medium text-gray-600">{shownEntries}</span> dari{" "}
        <span className="font-medium text-gray-600">{totalEntries}</span> data
      </p>
    </>
  );
}
