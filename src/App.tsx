import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Overview from "./pages/Overview"
import Strategies from "./pages/Strategies"
import VaultDashboard from "./pages/VaultDashboard"
import StabilityPool from "./pages/StabilityPool"

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/vault" element={<VaultDashboard />} />
                <Route path="/stability" element={<StabilityPool />} />
                <Route path="/strategies" element={<Strategies />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    )
}

export default App
