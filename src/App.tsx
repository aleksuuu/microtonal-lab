import "./App.scss";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Interval from "./pages/Interval";
import FreqToMidi from "./pages/FreqToMidi";
import NavBar from "./components/NavBar";
import UtilityTools from "./pages/UtilityTools";

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interval" element={<Interval />} />
          <Route path="/freq-to-midi" element={<FreqToMidi />} />
          <Route path="/utility-tools" element={<UtilityTools />} />
        </Routes>
      </main>
    </>
  );
}

export default App;

// https://hygraph.com/blog/routing-in-react
