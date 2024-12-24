import "./App.scss";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Interval from "./pages/Interval";
import Keyboard from "./pages/Keyboard";
import NavBar from "./components/NavBar";

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interval" element={<Interval />} />
          <Route path="/keyboard" element={<Keyboard />} />
        </Routes>
      </main>
    </>
  );
}

export default App;

// https://hygraph.com/blog/routing-in-react
