import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Star, Store, Users } from "lucide-react";
import { useOwnerStore } from "../stores/owner.store.js";

export default function OwnerDashboard() {
  const { ownerDashboardData, loading, error, fetchDashboard } = useOwnerStore();
  const [sort, setSort] = useState({ key: "created_at", direction: "desc" });
  useEffect(() => { fetchDashboard().catch(() => {}); }, [fetchDashboard]);

  const stores = useMemo(() => {
    const grouped = new Map();
    for (const row of ownerDashboardData?.data || []) {
      if (!grouped.has(row.store_id)) {
        grouped.set(row.store_id, {
          id: row.store_id,
          name: row.store_name,
          email: row.store_email,
          address: row.store_address,
          average: row.overall_rating,
          ratings: [],
        });
      }
      if (row.rating_id) grouped.get(row.store_id).ratings.push(row);
    }
    return [...grouped.values()];
  }, [ownerDashboardData]);

  const sortedRatings = (ratings) => [...ratings].sort((a, b) => {
    const left = a[sort.key] ?? "";
    const right = b[sort.key] ?? "";
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    const comparison = left !== "" && right !== "" && Number.isFinite(leftNumber) && Number.isFinite(rightNumber)
      ? leftNumber - rightNumber
      : String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: "base" });
    return sort.direction === "asc" ? comparison : -comparison;
  });
  const sortBy = (key) => setSort((current) => ({
    key,
    direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
  }));

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Store owner</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your store ratings</h1>
          <p className="mt-2 text-slate-600">See each store’s average and the customers who rated it.</p>
        </header>
        {loading && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading your stores…</p>}
        {!loading && error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-rose-800">{error.response?.data?.message || "Could not load your store ratings."}</p>}
        {!loading && !error && stores.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Store className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No stores assigned yet</h2>
            <p className="mt-1 text-sm text-slate-600">Ask an administrator to assign a store to your account.</p>
          </div>
        )}
        <div className="space-y-6">
          {stores.map((store) => (
            <article key={store.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{store.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{store.address}</p>
                </div>
                <div className="flex gap-3">
                  <div className="rounded-xl bg-amber-50 px-4 py-3">
                    <p className="text-xs text-amber-800">Average rating</p>
                    <p className="mt-1 flex items-center gap-1 font-bold text-slate-900"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{store.average == null ? "Not rated" : `${Number(store.average).toFixed(1)} / 5`}</p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 px-4 py-3">
                    <p className="text-xs text-indigo-800">Submissions</p>
                    <p className="mt-1 flex items-center gap-1 font-bold text-slate-900"><Users className="h-4 w-4" />{store.ratings.length}</p>
                  </div>
                </div>
              </div>
              {store.ratings.length === 0 ? (
                <p className="p-6 text-sm text-slate-500">No one has rated this store yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>{[["user_name", "Customer"], ["user_email", "Email"], ["rating", "Rating"], ["created_at", "Updated"]].map(([key, label]) => (
                        <th key={key} className="px-6 py-3">
                          <button type="button" onClick={() => sortBy(key)} className="inline-flex items-center gap-1 hover:text-slate-900">
                            {label}<ArrowUpDown className="h-3.5 w-3.5" />
                          </button>
                        </th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedRatings(store.ratings).map((rating) => (
                        <tr key={rating.rating_id}>
                          <td className="px-6 py-4 font-medium text-slate-900">{rating.user_name}</td>
                          <td className="px-6 py-4 text-slate-600">{rating.user_email}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">{rating.rating} / 5</td>
                          <td className="px-6 py-4 text-slate-600">{new Date(rating.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
