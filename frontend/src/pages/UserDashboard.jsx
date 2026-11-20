import { useEffect, useMemo, useState } from "react";
import { Search, Star, Store as StoreIcon } from "lucide-react";
import api from "../utils/axios.js";

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [draftRatings, setDraftRatings] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStores = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/user/stores");
      const rows = response.data.data || [];
      setStores(rows);
      setDraftRatings(Object.fromEntries(rows.map((store) => [store.store_id, store.user_rating || ""])));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load stores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const visibleStores = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return stores
      .filter((store) =>
        `${store.store_name || ""} ${store.address || ""}`.toLowerCase().includes(needle)
      )
      .sort((a, b) => {
        if (sortBy === "rating") return Number(b.overall_rating) - Number(a.overall_rating);
        return String(a.store_name).localeCompare(String(b.store_name));
      });
  }, [stores, searchTerm, sortBy]);

  const saveRating = async (store) => {
    const rating = Number(draftRatings[store.store_id]);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setNotice("Choose a rating from 1 to 5 first.");
      return;
    }
    setSavingId(store.store_id);
    setNotice("");
    setError("");
    try {
      const response = await api[store.user_rating ? "put" : "post"](
        `/user/stores/${store.store_id}/rating`,
        { rating }
      );
      setStores((current) => current.map((item) =>
        item.store_id === store.store_id
          ? { ...item, user_rating: response.data.data.user_rating, overall_rating: response.data.data.overall_rating }
          : item
      ));
      setNotice(store.user_rating ? "Your rating was updated." : "Your rating was submitted.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save your rating.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Store directory</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Find a store to rate</h1>
            <p className="mt-2 text-slate-600">Search stores, compare community ratings, and share your experience.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block">
              <span className="sr-only">Search by store name or address</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name or address" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm sm:w-64" />
            </label>
            <label className="sr-only" htmlFor="store-sort">Sort stores</label>
            <select id="store-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
              <option value="name">Sort: Store name</option>
              <option value="rating">Sort: Highest rated</option>
            </select>
          </div>
        </header>

        {notice && <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
        {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
        {loading ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">Loading stores…</p>
        ) : visibleStores.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleStores.map((store) => (
              <article key={store.store_id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-indigo-50 p-3 text-indigo-700"><StoreIcon className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">{store.store_name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{store.address}</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Overall rating</p>
                    <p className="mt-1 flex items-center gap-1 font-semibold text-slate-900"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{store.overall_rating == null ? "Not rated" : `${Number(store.overall_rating).toFixed(1)} / 5`}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Your rating</p>
                    <p className="mt-1 font-semibold text-slate-900">{store.user_rating ? `${store.user_rating} / 5` : "Not rated"}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor={`rating-${store.store_id}`}>Your rating</label>
                  <div className="flex gap-3">
                    <select id={`rating-${store.store_id}`} value={draftRatings[store.store_id] || ""}
                      onChange={(event) => setDraftRatings((current) => ({ ...current, [store.store_id]: event.target.value }))}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                      <option value="" disabled>Select 1–5 stars</option>
                      {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}
                    </select>
                    <button type="button" onClick={() => saveRating(store)} disabled={savingId === store.store_id}
                      className="rounded-xl bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:opacity-60">
                      {savingId === store.store_id ? "Saving…" : store.user_rating ? "Update" : "Submit"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <StoreIcon className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No stores found</h2>
            <p className="mt-1 text-sm text-slate-600">Try another search or check back after an administrator adds stores.</p>
          </div>
        )}
      </div>
    </section>
  );
}
