import { useMemo, useState } from "react";
import { Search, Star, ArrowUpDown } from "lucide-react";

export default function DataTable({ title, data, columns, filters, onFilterChange, rowKey = "Email" }) {
  const [sort, setSort] = useState({ column: columns[0], direction: "asc" });
  const sortedData = useMemo(() => [...data].sort((a, b) => {
    const left = a[sort.column] ?? "";
    const right = b[sort.column] ?? "";
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    const comparison = left !== "" && right !== "" && Number.isFinite(leftNumber) && Number.isFinite(rightNumber)
      ? leftNumber - rightNumber
      : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
    return sort.direction === "asc" ? comparison : -comparison;
  }), [data, sort]);

  const handleSort = (column) => setSort((current) => ({
    column,
    direction: current.column === column && current.direction === "asc" ? "desc" : "asc",
  }));

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{data.length} records</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filters.map((filter) => (
            <label key={filter.key} className="relative">
              <span className="sr-only">Filter by {filter.label}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" placeholder={`Filter by ${filter.label}`} value={filter.value}
                onChange={(event) => onFilterChange(filter.key, event.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
            </label>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>{columns.map((column) => (
              <th key={column} scope="col" aria-sort={sort.column === column ? (sort.direction === "asc" ? "ascending" : "descending") : "none"} className="whitespace-nowrap px-5 py-3 sm:px-6">
                <button type="button" onClick={() => handleSort(column)} className="inline-flex items-center gap-2 hover:text-slate-900">
                  {column}<ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.length ? sortedData.map((row, index) => (
              <tr key={row.id ?? row[rowKey] ?? index} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column} className="max-w-xs px-5 py-4 text-slate-700 sm:px-6">
                    {column === "Rating" && row[column] !== "-" && row[column] != null ? (
                      <span className="inline-flex items-center gap-1 font-medium"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{row[column]}</span>
                    ) : column === "Role" ? (
                      <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-800">
                        {String(row[column] || "").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}
                      </span>
                    ) : <span className="break-words">{row[column] ?? "—"}</span>}
                  </td>
                ))}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} className="px-6 py-14 text-center text-slate-500">No records match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
