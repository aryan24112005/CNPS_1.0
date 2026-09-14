import { useEffect, useState } from "react";

import {
    getAdminContactMessages,
    getAdminContactMessage,
    updateAdminContactMessageStatus,
    markAdminContactMessageAsRead,
    deleteAdminContactMessage,
} from "../services/adminContactMessagesService";

function AdminContactMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loadingMessage, setLoadingMessage] = useState(false);

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [filter, setFilter] = useState("all");

    /*
    |--------------------------------------------------------------------------
    | LOAD ALL MESSAGES
    |--------------------------------------------------------------------------
    */

    const loadMessages = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAdminContactMessages();

            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Load Contact Messages Error:", err);

            setError(
                err.message ||
                "Failed to load contact messages."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | OPEN MESSAGE
    |--------------------------------------------------------------------------
    */

    const openMessage = async (id) => {
        try {
            setLoadingMessage(true);
            setError("");

            const message =
                await getAdminContactMessage(id);

            setSelectedMessage(message);

            // Refresh list because opening a new message
            // automatically marks it as read.
            await loadMessages();
        } catch (err) {
            console.error(
                "Get Contact Message Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load contact message."
            );
        } finally {
            setLoadingMessage(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | CLOSE MESSAGE
    |--------------------------------------------------------------------------
    */

    const closeMessage = () => {
        if (updatingStatus) return;

        setSelectedMessage(null);
    };

    /*
    |--------------------------------------------------------------------------
    | MARK AS READ
    |--------------------------------------------------------------------------
    */

    const handleMarkAsRead = async (id) => {
        try {
            await markAdminContactMessageAsRead(id);

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === id
                        ? {
                            ...message,
                            is_read: 1,
                            status:
                                message.status === "new"
                                    ? "read"
                                    : message.status,
                        }
                        : message
                )
            );

            if (
                selectedMessage &&
                selectedMessage.id === id
            ) {
                setSelectedMessage((prev) => ({
                    ...prev,
                    is_read: 1,
                    status:
                        prev.status === "new"
                            ? "read"
                            : prev.status,
                }));
            }
        } catch (err) {
            console.error(
                "Mark As Read Error:",
                err
            );

            alert(
                err.message ||
                "Failed to mark message as read."
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    const handleStatusChange = async (
        id,
        status
    ) => {
        try {
            setUpdatingStatus(true);

            await updateAdminContactMessageStatus(
                id,
                status
            );

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === id
                        ? {
                            ...message,
                            status,
                            is_read:
                                status === "new"
                                    ? 0
                                    : 1,
                        }
                        : message
                )
            );

            if (
                selectedMessage &&
                selectedMessage.id === id
            ) {
                setSelectedMessage((prev) => ({
                    ...prev,
                    status,
                    is_read:
                        status === "new"
                            ? 0
                            : 1,
                }));
            }
        } catch (err) {
            console.error(
                "Update Message Status Error:",
                err
            );

            alert(
                err.message ||
                "Failed to update message status."
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE MESSAGE
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this message?"
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);

            await deleteAdminContactMessage(id);

            setMessages((prev) =>
                prev.filter(
                    (message) => message.id !== id
                )
            );

            if (
                selectedMessage &&
                selectedMessage.id === id
            ) {
                setSelectedMessage(null);
            }

            alert(
                "Contact message deleted successfully."
            );
        } catch (err) {
            console.error(
                "Delete Contact Message Error:",
                err
            );

            alert(
                err.message ||
                "Failed to delete contact message."
            );
        } finally {
            setDeletingId(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | FILTER MESSAGES
    |--------------------------------------------------------------------------
    */

    const filteredMessages =
        filter === "all"
            ? messages
            : messages.filter(
                (message) =>
                    message.status === filter
            );

    /*
    |--------------------------------------------------------------------------
    | COUNTS
    |--------------------------------------------------------------------------
    */

    const totalCount = messages.length;

    const newCount = messages.filter(
        (message) => message.status === "new"
    ).length;

    const readCount = messages.filter(
        (message) => message.status === "read"
    ).length;

    const repliedCount = messages.filter(
        (message) => message.status === "replied"
    ).length;

    const archivedCount = messages.filter(
        (message) => message.status === "archived"
    ).length;

    /*
    |--------------------------------------------------------------------------
    | DATE FORMAT
    |--------------------------------------------------------------------------
    */

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | STATUS BADGE
    |--------------------------------------------------------------------------
    */

    const getStatusBadge = (status) => {
        switch (status) {
            case "new":
                return (
                    <span className="badge bg-danger">
                        New
                    </span>
                );

            case "read":
                return (
                    <span className="badge bg-primary">
                        Read
                    </span>
                );

            case "replied":
                return (
                    <span className="badge bg-success">
                        Replied
                    </span>
                );

            case "archived":
                return (
                    <span className="badge bg-secondary">
                        Archived
                    </span>
                );

            default:
                return (
                    <span className="badge bg-light text-dark border">
                        {status || "Unknown"}
                    </span>
                );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <div className="container-fluid py-4">

            {/* ================================
                PAGE HEADER
            ================================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="fw-bold mb-1">
                        Contact Messages
                    </h2>

                    <p className="text-muted mb-0">
                        Manage messages received from
                        the school website contact form.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadMessages}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>

                    Refresh
                </button>

            </div>


            {/* ================================
                ERROR
            ================================= */}

            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}


            {/* ================================
                STAT CARDS
            ================================= */}

            <div className="row g-3 mb-4">

                <div className="col-6 col-md-4 col-lg">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted">
                                        Total
                                    </small>

                                    <h3 className="fw-bold mb-0">
                                        {totalCount}
                                    </h3>
                                </div>

                                <i
                                    className="bi bi-envelope"
                                    style={{
                                        fontSize: "28px",
                                    }}
                                ></i>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="col-6 col-md-4 col-lg">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted">
                                        New
                                    </small>

                                    <h3 className="fw-bold mb-0">
                                        {newCount}
                                    </h3>
                                </div>

                                <i
                                    className="bi bi-envelope-exclamation"
                                    style={{
                                        fontSize: "28px",
                                    }}
                                ></i>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="col-6 col-md-4 col-lg">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted">
                                        Read
                                    </small>

                                    <h3 className="fw-bold mb-0">
                                        {readCount}
                                    </h3>
                                </div>

                                <i
                                    className="bi bi-envelope-open"
                                    style={{
                                        fontSize: "28px",
                                    }}
                                ></i>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="col-6 col-md-4 col-lg">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted">
                                        Replied
                                    </small>

                                    <h3 className="fw-bold mb-0">
                                        {repliedCount}
                                    </h3>
                                </div>

                                <i
                                    className="bi bi-reply"
                                    style={{
                                        fontSize: "28px",
                                    }}
                                ></i>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="col-6 col-md-4 col-lg">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="text-muted">
                                        Archived
                                    </small>

                                    <h3 className="fw-bold mb-0">
                                        {archivedCount}
                                    </h3>
                                </div>

                                <i
                                    className="bi bi-archive"
                                    style={{
                                        fontSize: "28px",
                                    }}
                                ></i>
                            </div>
                        </div>
                    </div>
                </div>

            </div>


            {/* ================================
                FILTERS
            ================================= */}

            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body">

                    <div className="d-flex flex-wrap gap-2">

                        <button
                            type="button"
                            className={`btn ${filter === "all"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                            onClick={() =>
                                setFilter("all")
                            }
                        >
                            All ({totalCount})
                        </button>


                        <button
                            type="button"
                            className={`btn ${filter === "new"
                                    ? "btn-danger"
                                    : "btn-outline-danger"
                                }`}
                            onClick={() =>
                                setFilter("new")
                            }
                        >
                            New ({newCount})
                        </button>


                        <button
                            type="button"
                            className={`btn ${filter === "read"
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                            onClick={() =>
                                setFilter("read")
                            }
                        >
                            Read ({readCount})
                        </button>


                        <button
                            type="button"
                            className={`btn ${filter === "replied"
                                    ? "btn-success"
                                    : "btn-outline-success"
                                }`}
                            onClick={() =>
                                setFilter("replied")
                            }
                        >
                            Replied ({repliedCount})
                        </button>


                        <button
                            type="button"
                            className={`btn ${filter === "archived"
                                    ? "btn-secondary"
                                    : "btn-outline-secondary"
                                }`}
                            onClick={() =>
                                setFilter("archived")
                            }
                        >
                            Archived ({archivedCount})
                        </button>

                    </div>

                </div>

            </div>


            {/* ================================
                MESSAGE LIST
            ================================= */}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    {loading ? (

                        <div className="text-center py-5">

                            <div
                                className="spinner-border"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>

                            <p className="text-muted mt-3 mb-0">
                                Loading contact messages...
                            </p>

                        </div>

                    ) : filteredMessages.length === 0 ? (

                        <div className="text-center py-5">

                            <i
                                className="bi bi-inbox"
                                style={{
                                    fontSize: "48px",
                                }}
                            ></i>

                            <h5 className="mt-3">
                                No Messages Found
                            </h5>

                            <p className="text-muted mb-0">
                                There are no contact messages
                                in this category.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>

                                        <th
                                            style={{
                                                width: "55px",
                                            }}
                                        >
                                            #
                                        </th>

                                        <th>
                                            Sender
                                        </th>

                                        <th>
                                            Subject
                                        </th>

                                        <th>
                                            Message
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th
                                            className="text-end"
                                            style={{
                                                width: "170px",
                                            }}
                                        >
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredMessages.map(
                                        (message, index) => (

                                            <tr
                                                key={
                                                    message.id
                                                }
                                                style={{
                                                    fontWeight:
                                                        message.status ===
                                                            "new"
                                                            ? "600"
                                                            : "400",
                                                }}
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>


                                                {/* SENDER */}

                                                <td>

                                                    <div>
                                                        {message.name}
                                                    </div>

                                                    <small className="text-muted">
                                                        {message.email}
                                                    </small>

                                                </td>


                                                {/* SUBJECT */}

                                                <td>
                                                    {message.subject ||
                                                        "No subject"}
                                                </td>


                                                {/* MESSAGE */}

                                                <td
                                                    style={{
                                                        maxWidth:
                                                            "300px",
                                                    }}
                                                >
                                                    <div
                                                        className="text-truncate"
                                                        style={{
                                                            maxWidth:
                                                                "300px",
                                                        }}
                                                        title={
                                                            message.message
                                                        }
                                                    >
                                                        {
                                                            message.message
                                                        }
                                                    </div>
                                                </td>


                                                {/* DATE */}

                                                <td>
                                                    <small>
                                                        {formatDate(
                                                            message.created_at
                                                        )}
                                                    </small>
                                                </td>


                                                {/* STATUS */}

                                                <td>
                                                    {getStatusBadge(
                                                        message.status
                                                    )}
                                                </td>


                                                {/* ACTIONS */}

                                                <td className="text-end">

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        title="View Message"
                                                        onClick={() =>
                                                            openMessage(
                                                                message.id
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>


                                                    {message.status ===
                                                        "new" && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-success me-1"
                                                                title="Mark as Read"
                                                                onClick={() =>
                                                                    handleMarkAsRead(
                                                                        message.id
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-check2"></i>
                                                            </button>
                                                        )}


                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Delete Message"
                                                        onClick={() =>
                                                            handleDelete(
                                                                message.id
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            message.id
                                                        }
                                                    >
                                                        {deletingId ===
                                                            message.id ? (
                                                            <span
                                                                className="spinner-border spinner-border-sm"
                                                                role="status"
                                                            ></span>
                                                        ) : (
                                                            <i className="bi bi-trash"></i>
                                                        )}
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            {/* ================================
                MESSAGE MODAL
            ================================= */}

            {selectedMessage && (

                <div
                    className="modal d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0, 0, 0, 0.5)",
                        position: "fixed",
                        inset: 0,
                        overflowY: "auto",
                        padding: "20px 0",
                    }}
                >

                    <div className="modal-dialog modal-lg">

                        <div className="modal-content">

                            {/* MODAL HEADER */}

                            <div className="modal-header">

                                <div>

                                    <h5 className="modal-title mb-1">
                                        <i className="bi bi-envelope-open me-2"></i>
                                        Contact Message
                                    </h5>

                                    <small className="text-muted">
                                        Received{" "}
                                        {formatDate(
                                            selectedMessage.created_at
                                        )}
                                    </small>

                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={
                                        closeMessage
                                    }
                                ></button>

                            </div>


                            {/* MODAL BODY */}

                            <div className="modal-body">

                                {loadingMessage ? (

                                    <div className="text-center py-5">

                                        <div
                                            className="spinner-border"
                                            role="status"
                                        ></div>

                                        <p className="text-muted mt-3">
                                            Loading message...
                                        </p>

                                    </div>

                                ) : (

                                    <>

                                        {/* SENDER INFO */}

                                        <div className="row g-3 mb-4">

                                            <div className="col-md-6">

                                                <label className="form-label text-muted small">
                                                    Name
                                                </label>

                                                <div className="fw-semibold">
                                                    {
                                                        selectedMessage.name
                                                    }
                                                </div>

                                            </div>


                                            <div className="col-md-6">

                                                <label className="form-label text-muted small">
                                                    Email
                                                </label>

                                                <div>
                                                    <a
                                                        href={`mailto:${selectedMessage.email}`}
                                                    >
                                                        {
                                                            selectedMessage.email
                                                        }
                                                    </a>
                                                </div>

                                            </div>


                                            <div className="col-md-12">

                                                <label className="form-label text-muted small">
                                                    Subject
                                                </label>

                                                <div className="fw-semibold">
                                                    {
                                                        selectedMessage.subject ||
                                                        "No subject"
                                                    }
                                                </div>

                                            </div>

                                        </div>


                                        {/* MESSAGE */}

                                        <div className="border rounded p-3 bg-light mb-4">

                                            <label className="form-label text-muted small">
                                                Message
                                            </label>

                                            <div
                                                style={{
                                                    whiteSpace:
                                                        "pre-wrap",
                                                }}
                                            >
                                                {
                                                    selectedMessage.message
                                                }
                                            </div>

                                        </div>


                                        {/* STATUS */}

                                        <div className="row g-3">

                                            <div className="col-md-6">

                                                <label className="form-label">
                                                    Status
                                                </label>

                                                <select
                                                    className="form-select"
                                                    value={
                                                        selectedMessage.status ||
                                                        "new"
                                                    }
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            selectedMessage.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={
                                                        updatingStatus
                                                    }
                                                >

                                                    <option value="new">
                                                        New
                                                    </option>

                                                    <option value="read">
                                                        Read
                                                    </option>

                                                    <option value="replied">
                                                        Replied
                                                    </option>

                                                    <option value="archived">
                                                        Archived
                                                    </option>

                                                </select>

                                            </div>


                                            <div className="col-md-6">

                                                <label className="form-label">
                                                    Read Status
                                                </label>

                                                <div className="mt-2">

                                                    {selectedMessage.is_read ? (
                                                        <span className="badge bg-success">
                                                            <i className="bi bi-check2 me-1"></i>
                                                            Read
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-danger">
                                                            Unread
                                                        </span>
                                                    )}

                                                </div>

                                            </div>

                                        </div>

                                    </>

                                )}

                            </div>


                            {/* MODAL FOOTER */}

                            <div className="modal-footer">

                                {!selectedMessage.is_read && (

                                    <button
                                        type="button"
                                        className="btn btn-outline-success"
                                        onClick={() =>
                                            handleMarkAsRead(
                                                selectedMessage.id
                                            )
                                        }
                                    >
                                        <i className="bi bi-check2 me-1"></i>
                                        Mark as Read
                                    </button>

                                )}


                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() =>
                                        handleDelete(
                                            selectedMessage.id
                                        )
                                    }
                                    disabled={
                                        deletingId ===
                                        selectedMessage.id
                                    }
                                >
                                    <i className="bi bi-trash me-1"></i>
                                    Delete
                                </button>


                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={
                                        closeMessage
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default AdminContactMessages;