import { BrowserRouter, Routes, Route } from "react-router-dom";
import Parser from "./Pages/Parser/Parser.jsx";
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Parser />}>
          {/* <Route index element={<Home />} /> */}
          {/* <Route path="login" element={<Login />} /> */}
          <Route path="parser" element={<Parser />} />
          <Route path="*" element={<h1>Not found</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
