import { Link } from "react-router-dom";
import classDetails from "../data/classDetails";

function Pricing() {
  const classes = [
    {
      id: "nursery",
      title: "Nursery",
      category: "Early Education",
    },
    {
      id: "lkg",
      title: "LKG",
      category: "Early Education",
    },
    {
      id: "ukg",
      title: "UKG",
      category: "Primary Foundation",
    },

    {
      id: "primary-1",
      title: "Class 1",
      category: "Primary School",
    },
    {
      id: "primary-2",
      title: "Class 2",
      category: "Primary School",
    },
    {
      id: "primary-3",
      title: "Class 3",
      category: "Primary School",
    },
    {
      id: "primary-4",
      title: "Class 4",
      category: "Primary School",
    },
    {
      id: "primary-5",
      title: "Class 5",
      category: "Primary School",
    },

    {
      id: "middle-6",
      title: "Class 6",
      category: "Middle School",
    },
    {
      id: "middle-7",
      title: "Class 7",
      category: "Middle School",
    },
    {
      id: "middle-8",
      title: "Class 8",
      category: "Middle School",
    },

    {
      id: "secondary-9",
      title: "Class 9",
      category: "Secondary Education",
    },
    {
      id: "secondary-10",
      title: "Class 10",
      category: "Secondary Education",
    },

    {
      id: "pcm",
      title: "Science – PCM",
      category: "Senior Secondary",
    },
    {
      id: "pcb",
      title: "Science – PCB",
      category: "Senior Secondary",
    },
    {
      id: "commerce",
      title: "Commerce",
      category: "Senior Secondary",
    },
  ];

  return (
    <>
      {/* Page Title */}
      <div className="page-title" data-aos="fade">
        <div className="heading">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-lg-8">
                <h1>Fee Structure</h1>

                <p className="mb-0">
                  Explore the fee structure for different
                  classes and academic programs at DS Convent
                  School. Download the detailed fee structure
                  PDF for your respective class.
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
                Fee Structure
              </li>
            </ol>
          </div>
        </nav>
      </div>

      {/* Fee Structure */}
      <section id="pricing" className="pricing section">

        <div
          className="container section-title"
          data-aos="fade-up"
        >
          <h2>Fee Structure</h2>
          <p>Classes &amp; Fees</p>
        </div>

        <div className="container">
          <div className="row gy-4">

            {classes.map((item, index) => {

              const course = classDetails[item.id];

              return (
                <div
                  className="col-xl-3 col-lg-4 col-md-6"
                  key={item.id}
                  data-aos="fade-up"
                  data-aos-delay={(index % 4 + 1) * 100}
                >
                  <div className="pricing-item">

                    {/* Class */}
                    <h3>{item.title}</h3>

                    {/* Category */}
                    <p className="fee-category">
                      {item.category}
                    </p>

                    {/* Fee Info */}
                    <div className="fee-info">
                      <i className="bi bi-file-earmark-pdf"></i>

                      <span>
                        Detailed Fee Structure
                      </span>
                    </div>

                    {/* Download */}
                    {course?.feePdf ? (
                      <div className="btn-wrap">
                        <a
                          href={course.feePdf}
                          download
                          className="btn-buy fee-download-btn"
                        >
                          <i className="bi bi-download"> </i>
                          Download PDF
                        </a>
                      </div>
                    ) : (
                      <div className="btn-wrap">
                        <span className="fee-not-available">
                          Fee Structure Coming Soon
                        </span>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>
    </>
  );
}

export default Pricing;