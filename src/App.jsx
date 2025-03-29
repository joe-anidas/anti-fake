import { Routes, Route } from "react-router-dom";
import Connect from "./components/Connect";
import Dashboard from "./components/Dashboard";

function App({ provider }) {
  return (
    <Routes>
      <Route path="/" element={<Connect provider={provider} />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
