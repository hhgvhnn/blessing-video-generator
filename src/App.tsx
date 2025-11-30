import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import Preview from "@/pages/Preview";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/preview" element={<Preview />} />
      </Routes>
    </Router>
  );
}
