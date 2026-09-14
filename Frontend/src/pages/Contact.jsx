import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getPublicSettings } from "../services/settingsService";
import { sendContactMessage } from "../services/contactMessagesService";

function Contact() {
  const [settings, setSettings] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Settings
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      setError("");

      const data = await getPublicSettings();

      setSettings(data);
    } catch (err) {
      console.error("Contact Settings Error:", err);

      setError(
        "Unable to load contact information right now."
      );
    } finally {
      setLoadingSettings(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Handle Form Change
  |--------------------------------------------------------------------------
  */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setStatus("");
    setError("");
  };


  /*
  |--------------------------------------------------------------------------
  | Handle Contact Form Submit
  |--------------------------------------------------------------------------
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setStatus("");
      setError("");

      await sendContactMessage(form);

      setStatus(
        "Your message has been sent successfully. We will get back to you soon."
      );

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact Form Error:", err);

      setError(
        err.message ||
        "Failed to send your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };


  /*
  |--------------------------------------------------------------------------
  | Contact Settings
  |--------------------------------------------------------------------------
  */
  const address =
    settings?.contact_address ||
    "Pragati Vihar Colony, Gole ka Mandir, Gwalior (MP)";

  const phone =
    settings?.contact_phone ||
    "7974367854";

  const email =
    settings?.contact_email ||
    "info@example.com";


  /*
  |--------------------------------------------------------------------------
  | Google Maps Embed URL
  |--------------------------------------------------------------------------
  |
  | Admin can paste either:
  |
  | 1. Direct Google Maps Embed URL
  | 2. Complete iframe HTML copied from Google Maps
  |
  | We extract the src automatically from iframe HTML.
  |--------------------------------------------------------------------------
  */
  const getGoogleMapsEmbedUrl = (value) => {
    if (!value) {
      return "";
    }

    let url = value.trim();

    /*
    |--------------------------------------------------------------------------
    | If complete iframe HTML was pasted
    |--------------------------------------------------------------------------
    */
    const iframeMatch = url.match(
      /<iframe[^>]+src=["']([^"']+)["']/i
    );

    if (iframeMatch?.[1]) {
      url = iframeMatch[1];
    }

    /*
    |--------------------------------------------------------------------------
    | Only allow Google Maps Embed URLs
    |--------------------------------------------------------------------------
    */
    try {
      const parsedUrl = new URL(url);

      const isGoogleHost =
        parsedUrl.hostname === "www.google.com" ||
        parsedUrl.hostname === "google.com";

      const isGoogleMapsEmbed =
        parsedUrl.pathname.startsWith("/maps/embed");

      if (isGoogleHost && isGoogleMapsEmbed) {
        return parsedUrl.toString();
      }

      return "";
    } catch {
      return "";
    }
  };

  const mapUrl = getGoogleMapsEmbedUrl(
    settings?.map_url
  );


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */
  return (
    <>
      {/* =========================
                    Page Title
                ========================== */}

      <div
        className="page-title"
        data-aos="fade"
      >
        <div className="heading">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-lg-8">

                <h1>Contact</h1>

                <p className="mb-0">
                  Have a question or need more information?
                  Get in touch with DS Convent School.
                  We would be happy to assist you.
                </p>

              </div>
            </div>
          </div>
        </div>


        <nav className="breadcrumbs">
          <div className="container">

            <ol>
              <li>
                <Link to="/">
                  Home
                </Link>
              </li>

              <li className="current">
                Contact
              </li>
            </ol>

          </div>
        </nav>
      </div>


      {/* =========================
                    Contact Section
                ========================== */}

      <section
        id="contact"
        className="contact section"
      >

        {/* =========================
                        Google Map
                    ========================== */}

        <div
          className="mb-5"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          {loadingSettings ? (
            <div
              className="d-flex justify-content-center align-items-center bg-light"
              style={{
                height: "300px",
              }}
            >
              <div
                className="spinner-border text-primary"
                role="status"
              >
                <span className="visually-hidden">
                  Loading map...
                </span>
              </div>
            </div>
          ) : mapUrl ? (
            <iframe
              title="DS Convent School Location"
              style={{
                border: 0,
                width: "100%",
                height: "300px",
              }}
              src={mapUrl}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          ) : (
            <div
              className="d-flex justify-content-center align-items-center bg-light"
              style={{
                height: "300px",
              }}
            >
              <div className="text-center text-muted">

                <i
                  className="bi bi-geo-alt"
                  style={{
                    fontSize: "32px",
                  }}
                ></i>

                <p className="mb-0 mt-2">
                  School location map is not configured yet.
                </p>

              </div>
            </div>
          )}
        </div>


        {/* =========================
                        Contact Content
                    ========================== */}

        <div
          className="container"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="row gy-4">

            {/* =========================
                                Contact Information
                            ========================== */}

            <div className="col-lg-4">

              {/* Address */}

              <div
                className="info-item d-flex"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <i className="bi bi-geo-alt flex-shrink-0"></i>

                <div>

                  <h3>Address</h3>

                  <p
                    style={{
                      whiteSpace: "pre-line",
                    }}
                  >
                    {loadingSettings
                      ? "Loading..."
                      : address}
                  </p>

                </div>
              </div>


              {/* Phone */}

              <div
                className="info-item d-flex"
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <i className="bi bi-telephone flex-shrink-0"></i>

                <div>

                  <h3>Call Us</h3>

                  <p>
                    {loadingSettings
                      ? "Loading..."
                      : phone}
                  </p>

                </div>
              </div>


              {/* Email */}

              <div
                className="info-item d-flex"
                data-aos="fade-up"
                data-aos-delay="500"
              >
                <i className="bi bi-envelope flex-shrink-0"></i>

                <div>

                  <h3>Email Us</h3>

                  <p>
                    {loadingSettings
                      ? "Loading..."
                      : email}
                  </p>

                </div>
              </div>

            </div>


            {/* =========================
                                Contact Form
                            ========================== */}

            <div className="col-lg-8">

              <form
                onSubmit={handleSubmit}
                className="contact-form"
                data-aos="fade-up"
                data-aos-delay="200"
              >

                <div className="row gy-4">

                  {/* Name */}

                  <div className="col-md-6">

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Your Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* Email */}

                  <div className="col-md-6">

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Your Email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* Subject */}

                  <div className="col-md-12">

                    <input
                      type="text"
                      name="subject"
                      className="form-control"
                      placeholder="Subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* Message */}

                  <div className="col-md-12">

                    <textarea
                      name="message"
                      className="form-control"
                      rows="6"
                      placeholder="Message"
                      value={form.message}
                      onChange={handleChange}
                      required
                    ></textarea>

                  </div>


                  {/* Error */}

                  {error && (
                    <div className="col-md-12">

                      <div
                        className="alert alert-danger mb-0"
                        role="alert"
                      >
                        <i className="bi bi-exclamation-triangle me-2"></i>

                        {error}
                      </div>

                    </div>
                  )}


                  {/* Success */}

                  {status && (
                    <div className="col-md-12">

                      <div
                        className="contact-status"
                        role="alert"
                      >
                        <i className="bi bi-check-circle me-2"></i>

                        <span>
                          {status}
                        </span>
                      </div>

                    </div>
                  )}


                  {/* Submit */}

                  <div className="col-md-12 text-center">

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>

                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>

                          Send Message
                        </>
                      )}
                    </button>

                  </div>

                </div>

              </form>

            </div>

          </div>
        </div>

      </section>
    </>
  );
}

export default Contact;