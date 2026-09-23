import React, { useState, useRef, useEffect } from "react";
import { tokens } from "../../styles/tokens";
import { Ico } from "../../utils/icons";

// ── Custom Dropdown for Page Size ─────────────────────────────────────────

function CustomSelect({ value, onChange, options }: { value: number; onChange: (val: number) => void; options: { label: string, value: number }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative" ref={ref}>
      <button 
        type="button" 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-brandSoft"
      >
        {selectedLabel}
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-fade-in-up">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${o.value === value ? "bg-[#fef2f2] text-[#7b1113] font-bold" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const { color } = tokens;

// ── Table header cell ─────────────────────────────────────────────────────

export function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
  return (
    <th className={`px-2 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap ${
      align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
    }`}>
      {children} {align === "left" && children ? Ico.sort() : null}
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
      className={`px-2 py-2 text-[12px] whitespace-nowrap
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
  pageSize,
  onPageSize,
}: {
  search: string;
  onSearch: (value: string) => void;
  /** Currently selected page-size value. */
  pageSize?: number;
  /** Called when the user picks a different page size. */
  onPageSize?: (value: number) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Tampilkan</span>
        <CustomSelect 
          value={pageSize ?? 10} 
          onChange={(val) => onPageSize?.(val)}
          options={[
            { label: "10", value: 10 },
            { label: "25", value: 25 },
            { label: "50", value: 50 },
            { label: "100", value: 100 },
            { label: "500", value: 500 },
            { label: "Semua", value: 999999 },
          ]}
        />
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

// ── Reusable paginator ────────────────────────────────────────────────────

export function Paginator({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast  = currentPage >= totalPages;

  const btnBase = "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors duration-100 disabled:opacity-30";
  const btnActive = "border-gray-200 text-gray-600 hover:bg-gray-50";

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isFirst}
        onClick={() => onPageChange(currentPage - 1)}
        className={`${btnBase} ${btnActive}`}
        aria-label="Halaman sebelumnya"
      >
        ← Prev
      </button>
      <span className="text-xs text-gray-500 font-medium px-1">
        <span className="font-bold text-gray-800">{currentPage}</span>
        {" / "}
        <span className="font-bold text-gray-800">{totalPages}</span>
      </span>
      <button
        disabled={isLast}
        onClick={() => onPageChange(currentPage + 1)}
        className={`${btnBase} ${btnActive}`}
        aria-label="Halaman selanjutnya"
      >
        Next →
      </button>
    </div>
  );
}

// ── Full data table with header and footer count ──────────────────────────

export function DataTable({
  headers,
  children,
  shownEntries,
  totalEntries,
  currentPage,
  totalPages,
  onPageChange,
  showLeadingColumn = false,
  leadingHeader,
}: {
  headers: string[];
  children: React.ReactNode;
  shownEntries: number;
  totalEntries: number;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  showLeadingColumn?: boolean;
  leadingHeader?: React.ReactNode;
}) {
  return (
    <>
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {showLeadingColumn && (
                <th className="px-4 py-3 w-10">{leadingHeader ?? null}</th>
              )}
              {headers.map((h, i) => (
                <Th key={h || `col-${i}`} align={i === headers.length - 1 && (h === "Aksi" || h === "") ? "center" : "left"}>{h}</Th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">{children}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4 px-1">
        <p className="text-xs text-gray-400">
          Menampilkan{" "}
          <span className="font-medium text-gray-600">{shownEntries}</span> dari{" "}
          <span className="font-medium text-gray-600">{totalEntries}</span> data
        </p>
        {currentPage !== undefined && totalPages !== undefined && onPageChange && (
          <Paginator
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </>
  );
}
