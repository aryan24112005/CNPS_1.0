import { useEffect, useState } from "react";

import {
    getAdminAdmissions,
    getAdminAdmissionById,
    updateAdmissionStatus,
    updateAdmissionNotes,
    deleteAdmission,
} from "../services/adminAdmissionService";


const STATUS_OPTIONS = [
    "new",
    "contacted",
    "under_review",
    "approved",
    "enrolled",
    "rejected",
];


function formatStatus(status) {
    if (!status) return "";

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}


function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}


function AdminAdmissions() {
    const [applications, setApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [selectedApplication, setSelectedApplication] =
        useState(null);

    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const [savingStatus, setSavingStatus] =
        useState(false);

    const [savingNotes, setSavingNotes] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [notes, setNotes] =
        useState("");


    // ========================================
    // LOAD APPLICATIONS
    // ========================================

    const loadApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await getAdminAdmissions();

            setApplications(data);
        } catch (err) {
            console.error(
                "Load Admissions Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load admission applications."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadApplications();
    }, []);


    // ========================================
    // VIEW APPLICATION
    // ========================================

    const handleView = async (id) => {
        try {
            setDetailsLoading(true);
            setError("");

            const data =
                await getAdminAdmissionById(id);

            setSelectedApplication(data);

            setNotes(data.admin_notes || "");
        } catch (err) {
            console.error(
                "Load Admission Details Error:",
                err
            );

            setError(
                err.message ||
                "Failed to load application details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };


    // ========================================
    // CLOSE DETAILS
    // ========================================

    const closeDetails = () => {
        setSelectedApplication(null);
        setNotes("");
    };


    // ========================================
    // STATUS UPDATE
    // ========================================

    const handleStatusChange = async (
        id,
        status
    ) => {
        try {
            setSavingStatus(true);

            await updateAdmissionStatus(
                id,
                status
            );

            setApplications((current) =>
                current.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            status,
                        }
                        : item
                )
            );

            if (
                selectedApplication &&
                selectedApplication.id === id
            ) {
                setSelectedApplication(
                    (current) => ({
                        ...current,
                        status,
                    })
                );
            }
        } catch (err) {
            console.error(
                "Update Status Error:",
                err
            );

            alert(
                err.message ||
                "Failed to update status."
            );
        } finally {
            setSavingStatus(false);
        }
    };


    // ========================================
    // SAVE NOTES
    // ========================================

    const handleSaveNotes = async () => {
        if (!selectedApplication) return;

        try {
            setSavingNotes(true);

            await updateAdmissionNotes(
                selectedApplication.id,
                notes
            );

            setSelectedApplication(
                (current) => ({
                    ...current,
                    admin_notes: notes,
                })
            );

            setApplications((current) =>
                current.map((item) =>
                    item.id ===
                        selectedApplication.id
                        ? {
                            ...item,
                            admin_notes: notes,
                        }
                        : item
                )
            );

            alert(
                "Admin notes saved successfully."
            );
        } catch (err) {
            console.error(
                "Save Notes Error:",
                err
            );

            alert(
                err.message ||
                "Failed to save admin notes."
            );
        } finally {
            setSavingNotes(false);
        }
    };


    // ========================================
    // DELETE
    // ========================================

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this admission application?\n\nThis action cannot be undone."
            );

        if (!confirmed) return;

        try {
            setDeletingId(id);

            await deleteAdmission(id);

            setApplications((current) =>
                current.filter(
                    (item) => item.id !== id
                )
            );

            if (
                selectedApplication &&
                selectedApplication.id === id
            ) {
                closeDetails();
            }

            alert(
                "Admission application deleted successfully."
            );
        } catch (err) {
            console.error(
                "Delete Admission Error:",
                err
            );

            alert(
                err.message ||
                "Failed to delete application."
            );
        } finally {
            setDeletingId(null);
        }
    };


    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div className="admin-page">
                <div className="text-center py-5">
                    <div
                        className="spinner-border"
                        role="status"
                    ></div>

                    <p className="mt-3">
                        Loading admission applications...
                    </p>
                </div>
            </div>
        );
    }


    return (
        <div className="admin-page">

            {/* =================================
                HEADER
            ================================== */}

            <div className="admin-page-header d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="mb-1">
                        Admission Applications
                    </h2>

                    <p className="text-muted mb-0">
                        Manage student admission
                        applications submitted
                        through the website.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadApplications}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                </button>

            </div>


            {/* =================================
                ERROR
            ================================== */}

            {error && (
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}


            {/* =================================
                SUMMARY
            ================================== */}

            <div className="row g-3 mb-4">

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="text-muted small">
                                Total Applications
                            </div>

                            <h3 className="mb-0 mt-1">
                                {applications.length}
                            </h3>
                        </div>
                    </div>
                </div>


                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="text-muted small">
                                New
                            </div>

                            <h3 className="mb-0 mt-1">
                                {
                                    applications.filter(
                                        (item) =>
                                            item.status ===
                                            "new"
                                    ).length
                                }
                            </h3>
                        </div>
                    </div>
                </div>


                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="text-muted small">
                                Under Review
                            </div>

                            <h3 className="mb-0 mt-1">
                                {
                                    applications.filter(
                                        (item) =>
                                            item.status ===
                                            "under_review"
                                    ).length
                                }
                            </h3>
                        </div>
                    </div>
                </div>


                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="text-muted small">
                                Enrolled
                            </div>

                            <h3 className="mb-0 mt-1">
                                {
                                    applications.filter(
                                        (item) =>
                                            item.status ===
                                            "enrolled"
                                    ).length
                                }
                            </h3>
                        </div>
                    </div>
                </div>

            </div>


            {/* =================================
                APPLICATION TABLE
            ================================== */}

            <div className="card border-0 shadow-sm">

                <div className="card-body p-0">

                    {applications.length === 0 ? (
                        <div className="text-center py-5">

                            <i
                                className="bi bi-inbox"
                                style={{
                                    fontSize: "3rem",
                                }}
                            ></i>

                            <h4 className="mt-3">
                                No Admission Applications
                            </h4>

                            <p className="text-muted">
                                Applications submitted
                                from the website will
                                appear here.
                            </p>

                        </div>
                    ) : (
                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Student</th>
                                        <th>Class</th>
                                        <th>Parent</th>
                                        <th>Mobile</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th className="text-end">
                                            Action
                                        </th>
                                    </tr>
                                </thead>


                                <tbody>

                                    {applications.map(
                                        (application) => (
                                            <tr
                                                key={
                                                    application.id
                                                }
                                            >

                                                <td>
                                                    #
                                                    {
                                                        application.id
                                                    }
                                                </td>


                                                <td>
                                                    <strong>
                                                        {
                                                            application.student_name
                                                        }
                                                    </strong>

                                                    <div className="small text-muted">
                                                        {
                                                            application.email
                                                        }
                                                    </div>
                                                </td>


                                                <td>
                                                    {
                                                        application.class_applying
                                                    }

                                                    {application.stream && (
                                                        <div className="small text-muted">
                                                            {
                                                                application.stream
                                                            }

                                                            {application.science_group &&
                                                                ` (${application.science_group})`}
                                                        </div>
                                                    )}
                                                </td>


                                                <td>
                                                    {
                                                        application.parent_name ||
                                                        application.father_name ||
                                                        "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        application.phone
                                                    }
                                                </td>


                                                <td
                                                    style={{
                                                        minWidth:
                                                            "170px",
                                                    }}
                                                >
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={
                                                            application.status
                                                        }
                                                        disabled={
                                                            savingStatus
                                                        }
                                                        onChange={(
                                                            e
                                                        ) =>
                                                            handleStatusChange(
                                                                application.id,
                                                                e
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        {STATUS_OPTIONS.map(
                                                            (
                                                                status
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        status
                                                                    }
                                                                    value={
                                                                        status
                                                                    }
                                                                >
                                                                    {formatStatus(
                                                                        status
                                                                    )}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </td>


                                                <td>
                                                    {formatDate(
                                                        application.created_at
                                                    )}
                                                </td>


                                                <td className="text-end">

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary me-2"
                                                        onClick={() =>
                                                            handleView(
                                                                application.id
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-eye me-1"></i>
                                                        View
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        disabled={
                                                            deletingId ===
                                                            application.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                application.id
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-trash"></i>
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


            {/* =================================
                DETAILS MODAL
            ================================== */}

            {(selectedApplication ||
                detailsLoading) && (
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        style={{
                            backgroundColor:
                                "rgba(0,0,0,0.55)",
                        }}
                    >

                        <div className="modal-dialog modal-xl modal-dialog-scrollable">

                            <div className="modal-content">

                                <div className="modal-header">

                                    <div>
                                        <h5 className="modal-title">
                                            Admission Application
                                            Details
                                        </h5>

                                        {selectedApplication && (
                                            <small className="text-muted">
                                                Application #
                                                {
                                                    selectedApplication.id
                                                }
                                            </small>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={
                                            closeDetails
                                        }
                                    ></button>

                                </div>


                                {detailsLoading ? (
                                    <div className="modal-body text-center py-5">

                                        <div
                                            className="spinner-border"
                                            role="status"
                                        ></div>

                                        <p className="mt-3">
                                            Loading application...
                                        </p>

                                    </div>
                                ) : (
                                    selectedApplication && (
                                        <>
                                            <div className="modal-body">

                                                {/* Student Information */}

                                                <h6 className="border-bottom pb-2 mb-3">
                                                    <i className="bi bi-person me-2"></i>
                                                    Student Information
                                                </h6>

                                                <div className="row g-3 mb-4">

                                                    <div className="col-md-6">
                                                        <label className="text-muted small">
                                                            Student Name
                                                        </label>

                                                        <div className="fw-semibold">
                                                            {
                                                                selectedApplication.student_name
                                                            }
                                                        </div>
                                                    </div>


                                                    <div className="col-md-3">
                                                        <label className="text-muted small">
                                                            Date of Birth
                                                        </label>

                                                        <div>
                                                            {formatDate(
                                                                selectedApplication.dob
                                                            )}
                                                        </div>
                                                    </div>


                                                    <div className="col-md-3">
                                                        <label className="text-muted small">
                                                            Gender
                                                        </label>

                                                        <div>
                                                            {
                                                                selectedApplication.gender
                                                            }
                                                        </div>
                                                    </div>


                                                    <div className="col-md-4">
                                                        <label className="text-muted small">
                                                            Class
                                                        </label>

                                                        <div>
                                                            {
                                                                selectedApplication.class_applying
                                                            }
                                                        </div>
                                                    </div>


                                                    {selectedApplication.stream && (
                                                        <div className="col-md-4">
                                                            <label className="text-muted small">
                                                                Stream
                                                            </label>

                                                            <div>
                                                                {
                                                                    selectedApplication.stream
                                                                }
                                                            </div>
                                                        </div>
                                                    )}


                                                    {selectedApplication.science_group && (
                                                        <div className="col-md-4">
                                                            <label className="text-muted small">
                                                                Science Group
                                                            </label>

                                                            <div>
                                                                {
                                                                    selectedApplication.science_group
                                                                }
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>


                                                {/* Parent Information */}

                                                <h6 className="border-bottom pb-2 mb-3">
                                                    <i className="bi bi-people me-2"></i>
                                                    Parent Information
                                                </h6>

                                                <div className="row g-3 mb-4">

                                                    <div className="col-md-6">
                                                        <label className="text-muted small">
                                                            Father's Name
                                                        </label>

                                                        <div>
                                                            {
                                                                selectedApplication.father_name ||
                                                                "-"
                                                            }
                                                        </div>
                                                    </div>


                                                    <div className="col-md-6">
                                                        <label className="text-muted small">
                                                            Mother's Name
                                                        </label>

                                                        <div>
                                                            {
                                                                selectedApplication.mother_name ||
                                                                "-"
                                                            }
                                                        </div>
                                                    </div>

                                                </div>


                                                {/* Contact Information */}

                                                <h6 className="border-bottom pb-2 mb-3">
                                                    <i className="bi bi-telephone me-2"></i>
                                                    Contact Information
                                                </h6>

                                                <div className="row g-3 mb-4">

                                                    <div className="col-md-4">
                                                        <label className="text-muted small">
                                                            Mobile
                                                        </label>

                                                        <div>
                                                            {
                                                                selectedApplication.phone
                                                            }
                                                        </div>
                                                    </div>


                                                    <div className="col-md-8">
                                                        <label className="text-muted small">
                                                            Email
                                                        </label>

                                                        <div>
                                                            {
                                                                selectedApplication.email
                                                            }
                                                        </div>
                                                    </div>


                                                    <div className="col-md-12">
                                                        <label className="text-muted small">
                                                            Address
                                                        </label>

                                                        <div className="border rounded p-3">
                                                            {
                                                                selectedApplication.message ||
                                                                "-"
                                                            }
                                                        </div>
                                                    </div>

                                                </div>


                                                {/* Status */}

                                                <h6 className="border-bottom pb-2 mb-3">
                                                    <i className="bi bi-clipboard-check me-2"></i>
                                                    Application Status
                                                </h6>

                                                <div className="row g-3 mb-4">

                                                    <div className="col-md-6">

                                                        <label className="form-label">
                                                            Status
                                                        </label>

                                                        <select
                                                            className="form-select"
                                                            value={
                                                                selectedApplication.status
                                                            }
                                                            disabled={
                                                                savingStatus
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleStatusChange(
                                                                    selectedApplication.id,
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            {STATUS_OPTIONS.map(
                                                                (
                                                                    status
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            status
                                                                        }
                                                                        value={
                                                                            status
                                                                        }
                                                                    >
                                                                        {formatStatus(
                                                                            status
                                                                        )}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>

                                                    </div>


                                                    <div className="col-md-6">

                                                        <label className="form-label">
                                                            Submitted On
                                                        </label>

                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={formatDate(
                                                                selectedApplication.created_at
                                                            )}
                                                            readOnly
                                                        />

                                                    </div>

                                                </div>


                                                {/* Admin Notes */}

                                                <h6 className="border-bottom pb-2 mb-3">
                                                    <i className="bi bi-sticky me-2"></i>
                                                    Admin Notes
                                                </h6>

                                                <textarea
                                                    className="form-control"
                                                    rows="5"
                                                    placeholder="Add internal notes about this application..."
                                                    value={notes}
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setNotes(
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                ></textarea>

                                            </div>


                                            <div className="modal-footer">

                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={
                                                        closeDetails
                                                    }
                                                >
                                                    Close
                                                </button>


                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    disabled={
                                                        savingNotes
                                                    }
                                                    onClick={
                                                        handleSaveNotes
                                                    }
                                                >
                                                    {savingNotes ? (
                                                        <>
                                                            <span
                                                                className="spinner-border spinner-border-sm me-2"
                                                            ></span>
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-save me-2"></i>
                                                            Save Notes
                                                        </>
                                                    )}
                                                </button>

                                            </div>
                                        </>
                                    )
                                )}

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
}

export default AdminAdmissions;