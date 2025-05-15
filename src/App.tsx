import "./App.scss";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Interval from "./pages/Interval";
import PitchToMidi from "./pages/PitchToMidi";
import NavBar from "./components/NavBar";
import UtilityTools from "./pages/UtilityTools";
import Tuner from "./pages/Tuner";
import ScalaEditor from "./pages/ScalaEditor";
import MicrotonalKeyboard from "./pages/MicrotonalKeyboard";

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interval" element={<Interval />} />
          <Route path="/microtonal-keyboard" element={<MicrotonalKeyboard />} />
          <Route path="/pitch-to-midi" element={<PitchToMidi />} />
          <Route path="/utility-tools" element={<UtilityTools />} />
          <Route path="/tuner" element={<Tuner />} />
          <Route path="/scala-editor" element={<ScalaEditor />} />
        </Routes>
      </main>
    </>
  );
}

export default App;

// https://hygraph.com/blog/routing-in-react
