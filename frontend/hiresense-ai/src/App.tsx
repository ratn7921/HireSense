import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Login from "./pages/Login";
import AppLayout from "./layout/AppLayout";

import { FilterProvider } from "./context/FilterContext";

export default function App() {
  return (
    <FilterProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </AppLayout>
      </Router>
    </FilterProvider>
  );
}
