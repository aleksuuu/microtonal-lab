import "./App.scss";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Interval from "./pages/Interval";
import NavBar from "./components/NavBar";

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interval" element={<Interval />} />
        </Routes>
      </main>
    </>
  );
}

export default App;

//https://hygraph.com/blog/routing-in-react
