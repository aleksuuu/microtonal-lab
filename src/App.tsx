import "./App.scss";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Interval from "./pages/Interval";
import NavBar from "./components/NavBar";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interval" element={<Interval />} />
      </Routes>
    </>
  );
}

export default App;

//https://hygraph.com/blog/routing-in-react
