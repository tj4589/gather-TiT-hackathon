import { Routes, Route } from "react-router-dom";
import { Logo } from "./components/ui/Logo";
import { BuyerHome } from "./screens/BuyerHome";
import { CreateRequest } from "./screens/CreateRequest";
import { Entry } from "./screens/Entry";
import { ProcurementResults } from "./screens/ProcurementResults";

function Nav() {
  return (
    <header className="border-b border-neutral-200 bg-cream/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo variant="nav" height={26} />
        <span className="hidden text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-400 sm:inline">Small harvest. serious supply.</span>
      </div>
    </header>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-cream">
      <Nav />
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/buyer" element={<BuyerHome />} />
        <Route path="/request" element={<CreateRequest />} />
        <Route path="/results" element={<ProcurementResults />} />
      </Routes>
    </div>
  );
}

export default App;
