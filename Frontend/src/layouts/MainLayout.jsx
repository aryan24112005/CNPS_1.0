import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollTop from "../components/ScrollTop";

function MainLayout() {
    return (
        <>
            <Navbar />

            <main>
                <Outlet />
            </main>
            <ScrollTop />

            <Footer />
        </>
    );
}

export default MainLayout;