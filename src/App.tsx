import { Routes, Route } from "react-router-dom";
import { Logo } from "./components/ui/Logo";
import { CreateRequest } from "./screens/CreateRequest";
import { ProcurementResults } from "./screens/ProcurementResults";

function Nav() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <Logo variant="nav" height={26} />
      </div>
    </header>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <Routes>
        <Route path="/" element={<CreateRequest />} />
        <Route path="/results" element={<ProcurementResults />} />
      </Routes>
    </div>
  );
}

export default App;
