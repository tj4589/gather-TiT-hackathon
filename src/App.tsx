import { Routes, Route, useLocation, Link } from "react-router-dom";
import { Logo } from "./components/ui/Logo";
import { CreateRequest } from "./screens/CreateRequest";
import { ProcurementResults } from "./screens/ProcurementResults";
import { FarmerIntake } from "./screens/FarmerIntake";

function Nav() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/">
          <Logo variant="nav" height={26} />
        </Link>
        <Link to="/farmer" className="text-[13px] font-medium text-neutral-500 hover:text-ink">
          Farmer call
        </Link>
      </div>
    </header>
  );
}

function App() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-cream">
      {!isLanding && <Nav />}
      <Routes>
        <Route path="/" element={<CreateRequest />} />
        <Route path="/results" element={<ProcurementResults />} />
        <Route path="/farmer" element={<FarmerIntake />} />
      </Routes>
    </div>
  );
}

export default App;
