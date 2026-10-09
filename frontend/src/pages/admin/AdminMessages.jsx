import { useEffect, useState, useCallback } from "react";
import {
  getMessages,
  updateMessage,
  deleteMessage,
} from "../../services/adminService";

// ── Helpers ───────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_META = {
  new:      { label: "New",      bg: "#DBEAFE", color: "#1D4ED8" },
  read:     { label: "Read",     bg: "#F3F4F6", color: "#6B7280" },
  replied:  { label: "Replied",  bg: "#DCFCE7", color: "#166534" },
  archived: { label: "Archived", bg: "#FEF3C7", color: "#92400E" },
};

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div
    style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      pointerEvents: "none",
    }}
  >
    {toasts.map((t) => (
      <div
        key={t.id}
        style={{
          padding: "12px 20px",
          borderRadius: 10,
          background: t.type === "error" ? "#FEE2E2" : "#DCFCE7",
          color: t.type === "error" ? "#991B1B" : "#166534",
          border: `1px solid ${t.type === "error" ? "#FCA5A5" : "#86EFAC"}`,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          fontSize: "0.9rem",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 280,
          pointerEvents: "auto",
        }}
      >
        <i className={`bi ${t.type === "error" ? "bi-x-circle-fill" : "bi-check-circle-fill"}`} />
        {t.message}
      </div>
    ))}
  </div>
);

const PAGE_SIZE = 10;

// ── Main Component ────────────────────────────────────────────
export default function AdminMessages() {
  const [items, setItems]               = useState([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [searchInput, setSearchInput]   = useState("");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [modalNotes, setModalNotes]     = useState("");
  const [toasts, setToasts]             = useState([]);

  // ── Toast helpers ──
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMessages({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      if (Array.isArray(res)) {
        setItems(res);
        setTotal(res.length);
      } else if (res && Array.isArray(res.data)) {
        setItems(res.data);
        setTotal(res.total ?? res.data.length);
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (err) {
      setError("Failed to load contact messages.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Search ──
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  // ── Open message modal (marks as read) ──
  const openModal = async (item) => {
    setSelectedItem(item);
    setModalNotes(item.adminNotes ?? "");
    // Mark as read if currently new
    if (item.status === "new" || !item.isRead) {
      try {
        await updateMessage(item._id, { status: "read", isRead: true });
        setItems((prev) =>
          prev.map((m) =>
            m._id === item._id ? { ...m, status: "read", isRead: true } : m
          )
        );
        setSelectedItem((prev) => prev ? { ...prev, status: "read", isRead: true } : prev);
      } catch {
        // Non-critical — silently ignore
      }
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalNotes("");
  };

  // ── Save notes / status ──
  const handleModalSave = async (newStatus) => {
    if (!selectedItem) return;
    setSaving(true);
    try {
      const payload = { adminNotes: modalNotes };
      if (newStatus) payload.status = newStatus;
      await updateMessage(selectedItem._id, payload);
      setItems((prev) =>
        prev.map((m) =>
          m._id === selectedItem._id ? { ...m, ...payload } : m
        )
      );
      addToast("Message updated successfully.");
      closeModal();
    } catch {
      addToast("Failed to save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMessage(deleteTarget._id);
      setItems((prev) => prev.filter((m) => m._id !== deleteTarget._id));
      setTotal((prev) => Math.max(0, prev - 1));
      addToast("Message deleted successfully.");
      setDeleteTarget(null);
    } catch {
      addToast("Failed to delete message.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Count unread
  const unreadCount = items.filter((m) => m.status === "new" || !m.isRead).length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--navy)", margin: 0 }}>
            Contact Messages
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginTop: 4, marginBottom: 0 }}>
            View and respond to messages from parents and students
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {unreadCount > 0 && (
            <span style={{ fontSize: "0.88rem", background: "#DBEAFE", color: "#1D4ED8", padding: "6px 14px", borderRadius: 999, fontWeight: 600 }}>
              <i className="bi bi-envelope-fill" style={{ marginRight: 6 }} />
              {unreadCount} unread
            </span>
          )}
          <span style={{ fontSize: "0.88rem", color: "var(--text-muted)", background: "var(--bg-section)", padding: "6px 14px", borderRadius: 999, fontWeight: 500 }}>
            {total} total
          </span>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, maxWidth: 440 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <i
              className="bi bi-search"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.9rem" }}
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email…"
              style={{
                width: "100%",
                padding: "9px 36px 9px 36px",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: "0.9rem",
                color: "var(--navy)",
                background: "#fff",
                outline: "none",
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, fontSize: "0.9rem" }}
              >
                <i className="bi bi-x-lg" />
              </button>
            )}
          </div>
          <button
            type="submit"
            style={{ padding: "9px 18px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
          >
            Search
          </button>
        </form>
      </div>

      {/* ── Table Card ── */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        {loading ? (
          <div className="loading-state" style={{ padding: "60px 20px" }}>
            <div className="spinner" />
            <span>Loading messages…</span>
          </div>
        ) : error ? (
          <div className="alert alert-error" style={{ margin: 24 }}>
            <i className="bi bi-exclamation-circle-fill" />
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px 20px" }}>
            <i className="bi bi-inbox" style={{ fontSize: "2.5rem", color: "var(--border)" }} />
            <p>{search ? "No messages match your search." : "No contact messages yet."}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "var(--bg-section)" }}>
                  {["Name", "Email", "Phone", "Subject", "Date", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: "0.76rem",
                        color: "var(--text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const isUnread = item.status === "new" || !item.isRead;
                  return (
                    <tr
                      key={item._id ?? idx}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                        background: isUnread ? "#FAFCFF" : "transparent",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-section)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isUnread ? "#FAFCFF" : "transparent")}
                      onClick={() => openModal(item)}
                    >
                      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: isUnread ? "#DBEAFE" : "var(--bg-section)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <i className={`bi bi-person-fill`} style={{ color: isUnread ? "#1D4ED8" : "var(--text-muted)", fontSize: "0.85rem" }} />
                          </div>
                          <span style={{ fontWeight: isUnread ? 700 : 500, color: "var(--navy)" }}>
                            {item.name ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", color: "var(--text-secondary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: isUnread ? 600 : 400 }}>
                        {item.email ?? "—"}
                      </td>
                      <td style={{ padding: "13px 16px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {item.phone || "—"}
                      </td>
                      <td style={{ padding: "13px 16px", color: "var(--text-secondary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: isUnread ? 600 : 400 }}>
                        {item.subject || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No subject</span>}
                      </td>
                      <td style={{ padding: "13px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {formatDate(item.createdAt)}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <StatusBadge status={item.status ?? (item.isRead ? "read" : "new")} />
                      </td>
                      <td style={{ padding: "13px 16px" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); openModal(item); }}
                            title="View message"
                            style={{ padding: "6px 10px", background: "var(--bg-soft-blue)", color: "var(--primary)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem" }}
                          >
                            <i className="bi bi-eye-fill" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
                            title="Delete"
                            style={{ padding: "6px 10px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.82rem" }}
                          >
                            <i className="bi bi-trash-fill" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && !error && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total} messages
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              style={{ padding: "7px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "#fff", cursor: page === 1 ? "default" : "pointer", color: page === 1 ? "var(--text-muted)" : "var(--navy)", fontWeight: 500, fontSize: "0.85rem" }}
            >
              <i className="bi bi-chevron-left" /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span key={`e-${idx}`} style={{ padding: "7px 4px", color: "var(--text-muted)", fontSize: "0.85rem" }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: "7px 13px",
                      border: `1px solid ${p === page ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 8,
                      background: p === page ? "var(--primary)" : "#fff",
                      color: p === page ? "#fff" : "var(--navy)",
                      cursor: "pointer",
                      fontWeight: p === page ? 700 : 500,
                      fontSize: "0.85rem",
                    }}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{ padding: "7px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "#fff", cursor: page === totalPages ? "default" : "pointer", color: page === totalPages ? "var(--text-muted)" : "var(--navy)", fontWeight: 500, fontSize: "0.85rem" }}
            >
              Next <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      )}

      {/* ── Message Detail Modal ── */}
      {selectedItem && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(10,20,40,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.22)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", color: "var(--navy)" }}>
                  Message from {selectedItem.name}
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Received {formatDateTime(selectedItem.createdAt)}
                </p>
              </div>
              <button
                onClick={closeModal}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-muted)", padding: 4 }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "24px" }}>
              {/* Sender info */}
              <div className="modal-form-grid" style={{ gap: "14px 24px", marginBottom: 20 }}>
                {[
                  { label: "Name",    value: selectedItem.name },
                  { label: "Email",   value: selectedItem.email },
                  { label: "Phone",   value: selectedItem.phone || "—" },
                  { label: "Status",  value: <StatusBadge status={selectedItem.status ?? "new"} /> },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>{label}</p>
                    <div style={{ fontSize: "0.92rem", color: "var(--navy)", fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Subject */}
              {selectedItem.subject && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>Subject</p>
                  <p style={{ fontSize: "0.95rem", color: "var(--navy)", fontWeight: 600, margin: 0 }}>{selectedItem.subject}</p>
                </div>
              )}

              {/* Message body */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px" }}>Message</p>
                <div style={{ background: "var(--bg-section)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px", fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {selectedItem.message}
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "20px 0" }} />

              {/* Mark as / Status actions */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Update Status</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.entries(STATUS_META).map(([val, meta]) => (
                    <button
                      key={val}
                      onClick={() => {
                        setSelectedItem((prev) => prev ? { ...prev, status: val } : prev);
                        setItems((prev) => prev.map((m) => m._id === selectedItem._id ? { ...m, status: val } : m));
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 999,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        border: `2px solid ${selectedItem.status === val ? meta.color : "transparent"}`,
                        background: selectedItem.status === val ? meta.bg : "var(--bg-section)",
                        color: selectedItem.status === val ? meta.color : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin notes */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Admin Notes (internal only)
                </label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes…"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 8, fontSize: "0.9rem", color: "var(--navy)", resize: "vertical", outline: "none", fontFamily: "inherit" }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  onClick={() => { closeModal(); setDeleteTarget(selectedItem); }}
                  style={{ padding: "10px 18px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
                >
                  <i className="bi bi-trash-fill" style={{ marginRight: 6 }} />
                  Delete
                </button>
                <button
                  onClick={closeModal}
                  style={{ padding: "10px 18px", background: "var(--bg-section)", color: "var(--navy)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleModalSave(selectedItem.status)}
                  disabled={saving}
                  style={{ padding: "10px 22px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, cursor: saving ? "default" : "pointer", fontWeight: 600, fontSize: "0.9rem", opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? <><i className="bi bi-arrow-repeat" style={{ marginRight: 6 }} />Saving…</> : <><i className="bi bi-check-lg" style={{ marginRight: 6 }} />Save</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(10,20,40,0.55)", zIndex: 1010, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
        >
          <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 420, padding: 32, textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.22)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <i className="bi bi-trash-fill" style={{ fontSize: "1.4rem", color: "#DC2626" }} />
            </div>
            <h4 style={{ color: "var(--navy)", marginBottom: 8 }}>Delete Message?</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: 24 }}>
              This will permanently delete the message from <strong>{deleteTarget.name}</strong>. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{ padding: "10px 22px", background: "var(--bg-section)", color: "var(--navy)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ padding: "10px 22px", background: "#DC2626", color: "#fff", border: "none", borderRadius: 8, cursor: deleting ? "default" : "pointer", fontWeight: 600, opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  );
}

// ── StatusBadge (local) ───────────────────────────────────────
function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? { label: status, bg: "#F3F4F6", color: "#374151" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: "0.75rem",
        fontWeight: 600,
        background: meta.bg,
        color: meta.color,
        textTransform: "capitalize",
      }}
    >
      {meta.label}
    </span>
  );
}
