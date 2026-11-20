import React from "react";
import { Outlet } from "react-router-dom";
import { PublicNavbar } from "./PublicNavbar";
import { PublicFooter } from "./PublicFooter";

export const PublicLayout: React.FC = () => {
  return (
    <div className="spatial-bg min-h-screen flex flex-col relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Ambient Spatial Lighting Orbs */}
      <div className="spatial-glow-top-right" />
      <div className="spatial-glow-bottom-left" />

      {/* Floating Glass Navbar */}
      <PublicNavbar />

      {/* Page Main Content */}
      <main className="flex-1 pt-24 pb-16 relative z-10">
        <Outlet />
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};
