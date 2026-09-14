import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPublicFaculty,
  getPublicFacultyImageUrl,
} from "../services/facultyService";

function Trainers() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicFaculty();
        setFaculty(data);
      } catch (err) {
        console.error("Failed to load faculty:", err);
        setError("Unable to load faculty members.");
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  return (
    <>
      {/* Page Title */}
      <div className="page-title" data-aos="fade">
        <div className="heading">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-lg-8">
                <h1>Our Trainers</h1>

                <p>
                  Meet our dedicated teachers who guide,
                  support, and inspire students throughout
                  their academic journey.
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="breadcrumbs">
          <div className="container">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>

              <li className="current">
                Trainers
              </li>
            </ol>
          </div>
        </nav>
      </div>

      {/* Trainers Section */}
      <section
        id="trainers-index"
        className="section trainers-index trainers-page"
      >
        <div className="container">

          {/* Section Title */}
          <div
            className="section-title"
            data-aos="fade-up"
          >
            <h2>Trainers</h2>
            <p>Our Dedicated Faculty</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-5">
              <div
                className="spinner-border"
                role="status"
                aria-label="Loading faculty"
              ></div>

              <p className="mt-3 mb-0">
                Loading faculty...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-5">
              <p className="text-danger mb-0">
                {error}
              </p>
            </div>
          )}

          {/* No Faculty */}
          {!loading && !error && faculty.length === 0 && (
            <div className="text-center py-5">
              <p className="mb-0">
                No faculty members available at the moment.
              </p>
            </div>
          )}

          {/* Trainers */}
          {!loading && !error && faculty.length > 0 && (
            <div className="row">
              {faculty.map((trainer, index) => (
                <div
                  className="col-lg-4 col-md-6 d-flex"
                  data-aos="fade-up"
                  data-aos-delay={(index + 1) * 100}
                  key={trainer.id}
                >
                  <div className="member">

                    {/* Faculty Photo */}
                    {trainer.photo ? (
                      <img
                        src={getPublicFacultyImageUrl(trainer.photo)}
                        className="img-fluid"
                        alt={trainer.name}
                      />
                    ) : (
                      <div className="faculty-no-image">
                        <i className="bi bi-person-circle"></i>
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="social">

                      {trainer.facebook_url && (
                        <a
                          href={trainer.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Facebook"
                        >
                          <i className="bi bi-facebook"></i>
                        </a>
                      )}

                      {trainer.instagram_url && (
                        <a
                          href={trainer.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                        >
                          <i className="bi bi-instagram"></i>
                        </a>
                      )}

                      {trainer.linkedin_url && (
                        <a
                          href={trainer.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="LinkedIn"
                        >
                          <i className="bi bi-linkedin"></i>
                        </a>
                      )}

                      {trainer.youtube_url && (
                        <a
                          href={trainer.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="YouTube"
                        >
                          <i className="bi bi-youtube"></i>
                        </a>
                      )}

                    </div>

                    {/* Faculty Content */}
                    <div className="member-content">
                      <h4>{trainer.name}</h4>

                      <span>
                        {trainer.designation || "Faculty Member"}
                      </span>

                      <p>
                        {trainer.short_bio ||
                          trainer.qualification ||
                          ""}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </>
  );
}

export default Trainers;