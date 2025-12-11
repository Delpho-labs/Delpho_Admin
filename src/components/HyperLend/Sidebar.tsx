import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaChartBar, FaLock } from "react-icons/fa";

const navItems = [
  { label: "Overview", icon: <FaTachometerAlt />, path: "/overview" },
  { label: "Strategies", icon: <FaChartBar />, path: "/strategies" },
  { label: "Delpho Vault", icon: <FaLock />, path: "/vault" },
];

const HomeSidebar: React.FC = () => {
  const navigate = useNavigate();
  return (
    <aside className="w-64 bg-[#0B1212] flex flex-col justify-between py-6 px-4 min-h-screen max-h-screen overflow-y-auto sticky top-0">
      <div>
        <div className="flex items-center mb-10">
          <span className="w-10 h-10 bg-[#1A2323] rounded-full flex items-center justify-center mr-3">
            <span className="text-2xl font-bold">D</span>
          </span>
          <span className="text-2xl font-bold">Delpho Admin</span>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex items-center gap-3 px-4 py-2 rounded-full text-left transition-colors text-lg hover:bg-[#1A2323] cursor-pointer`}
              onClick={() => navigate(item.path)}
            >
              <span className="w-5 h-5 flex items-center justify-center text-xl">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default HomeSidebar;
