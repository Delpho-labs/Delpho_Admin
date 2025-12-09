import React from "react";
import HomeSidebar from "../components/HomeSidebar";
import TopNav from "../components/TopNav";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#101616] via-[#0B1212] to-[#1A2323] text-[#E6FFF6]">
      <HomeSidebar />
      <main className="flex-1 flex flex-col p-8">
        <TopNav title="Welcome to Delpho Admin" />
        <div className="flex-1 flex flex-col justify-center items-center">
          <p className="text-xl text-[#A3B8B0] mb-8 max-w-xl text-center">
            Manage and monitor your DeFi dashboards in one place. Use the
            sidebar to navigate to the Overview, Strategies, or Delpho Vault
            dashboards.
          </p>
          <div className="mt-8 text-[#4B5C5C] text-sm">
            Select a dashboard from the left to get started.
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
