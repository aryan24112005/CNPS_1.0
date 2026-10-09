import { useEffect, useState } from "react";
import PureCounter from "@srexi/purecounterjs";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function CountsSection() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCounts = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/public/homepage/counts`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load homepage counts."
                    );
                }

                setStats(data.counts || []);
            } catch (error) {
                console.error("Homepage counts error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadCounts();
    }, []);

    useEffect(() => {
        if (stats.length > 0) {
            new PureCounter();
        }
    }, [stats]);

    if (loading) {
        return null;
    }

    return (
        <section
            id="counts"
            className="section counts light-background"
        >
            <div
                className="container"
                data-aos="fade-up"
                data-aos-delay="100"
            >
                <div className="row gy-4">

                    {stats.map((stat) => (
                        <div
                            className="col-lg-3 col-md-6"
                            key={stat.id}
                        >
                            <div className="stats-item text-center w-100 h-100">

                                {/* ICON */}
                                {stat.icon && (
                                    <i
                                        className={stat.icon}
                                        style={{
                                            fontSize: "32px",
                                            display: "block",
                                            marginBottom: "10px",
                                        }}
                                    ></i>
                                )}

                                {/* NUMBER */}
                                <span
                                    className="purecounter"
                                    data-purecounter-start="0"
                                    data-purecounter-end={stat.value}
                                    data-purecounter-duration="1"
                                >
                                    0
                                </span>

                                {/* LABEL */}
                                <p>
                                    {stat.label}
                                </p>

                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
}

export default CountsSection;