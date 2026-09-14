import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getPublicFaculty,
    getPublicFacultyImageUrl,
} from "../services/facultyService";

function TrainersSection() {
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFaculty();
    }, []);

    const loadFaculty = async () => {
        try {
            setLoading(true);

            const data = await getPublicFaculty();

            // Homepage par sirf first 3 faculty members
            setFaculty((data || []).slice(0, 3));
        } catch (error) {
            console.error("Homepage Faculty Error:", error);
            setFaculty([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="trainers-index" className="section trainers-index">
            <div className="container">
                <div className="row">

                    {loading ? (
                        <div className="col-12 text-center">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : faculty.length === 0 ? (
                        <div className="col-12 text-center">
                            <p className="text-muted">
                                No faculty members available.
                            </p>
                        </div>
                    ) : (
                        faculty.map((member, index) => (
                            <div
                                className="col-lg-4 col-md-6 d-flex"
                                data-aos="fade-up"
                                data-aos-delay={(index + 1) * 100}
                                key={member.id}
                            >
                                <div className="member">

                                    {member.photo && (
                                        <img
                                            src={getPublicFacultyImageUrl(
                                                member.photo
                                            )}
                                            className="img-fluid"
                                            alt={member.name}
                                        />
                                    )}

                                    <div className="member-content">
                                        <h4>{member.name}</h4>

                                        <span>
                                            {member.designation}
                                        </span>

                                        <p>
                                            {member.short_bio ||
                                                member.bio ||
                                                "Faculty member at DS Convent School."}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        ))
                    )}

                </div>

                <div className="text-center mt-4">
                    <Link
                        to="/trainers"
                        className="btn-get-started"
                    >
                        View All Trainers
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default TrainersSection;