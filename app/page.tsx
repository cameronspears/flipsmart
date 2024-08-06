// app/page.tsx

"use client";

import React from "react";
import SearchBar from "@/components/SearchBar";

const HomePage = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Removed ModeToggle */}
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100 z-10">
        Flipsmart
      </h1>
      <SearchBar />
    </div>
  );
};

export default HomePage;
