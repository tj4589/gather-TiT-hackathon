import { Routes, Route } from "react-router-dom";
import { Logo } from "./components/ui/Logo";
import { CreateRequest } from "./screens/CreateRequest";
import { ProcurementResults } from "./screens/ProcurementResults";
import { FarmerCall } from "./screens/FarmerCall";

function Nav() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo variant="nav" height={26} />
          <a href="/farmer" className="text-[13px] font-medium text-green hover:text-green-800">Farmer call</a>
        </div>
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
        <Route path="/farmer" element={<FarmerCall />} />
      </Routes>
    </div>
  );
}

export default App;
