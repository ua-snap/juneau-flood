import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./styles/App2.css";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import FloodLevels from "./pages/FloodLevels";
import FloodForecast from "./pages/FloodForecast";
import FloodEvents from "./pages/FloodEvents";
import SuicideBasin from "./pages/SuicideBasin";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import ScrollToHashElement from "./components/ScrollToHashElement";
import Feedback from "./pages/feedback";
import SBmodel from "./pages/SBmodel2";

// Wrap routes in a layout-aware container
const Layout = ({ children }) => {
  const location = useLocation();
  const noLayoutRoutes = ["/sb-model"]; // Add paths that should have no header/footer
  const isMinimal = noLayoutRoutes.includes(location.pathname);

  return (
    <div className={`app-container ${isMinimal ? "full-screen-page" : ""}`}>
      {!isMinimal && <Header />}
      {!isMinimal && <Navigation />}

      <div className="main-content">{children}</div>

      {!isMinimal && <Footer />}
    </div>
  );
};

const App2 = () => {
  return (
    <Router>
      <ScrollToHashElement />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/flood-map" element={<FloodLevels />} />
          <Route path="/flood-forecast" element={<FloodForecast />} />
          <Route path="/flood-events" element={<FloodEvents />} />
          <Route path="/suicide-basin" element={<SuicideBasin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/sb-model" element={<SBmodel />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App2;
