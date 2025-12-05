"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { MenuCard } from "@/components/MenuCard";
import { AdBanner } from "@/components/AdBanner";
import { mockMenus } from "@/data/menus";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("istanbul");
  const [activeNavItem, setActiveNavItem] = useState("monthly");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header selectedCity={selectedCity} onCityChange={setSelectedCity} />

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:w-60 lg:shrink-0">
            <div className="sticky top-[80px]">
              <Sidebar activeItem={activeNavItem} onItemClick={setActiveNavItem} />
            </div>
          </div>

          {/* Main Content */}
          <main className="min-w-0 flex-1">
            {/* Page Title */}
            <h1 className="mb-8 text-center text-2xl font-bold text-gray-900 lg:text-3xl">
              KYK Yemek
            </h1>

            {/* Mobile Navigation */}
            <div className="mb-8 lg:hidden">
              <div className="flex flex-wrap justify-center gap-2">
                {["monthly", "upload", "login"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveNavItem(item)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      activeNavItem === item
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item === "monthly" && "Aylık Menü"}
                    {item === "upload" && "Menü Yükle"}
                    {item === "login" && "Giriş Yap"}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Cards */}
            <div className="flex flex-col gap-10">
              {mockMenus.map((menu) => (
                <MenuCard key={menu.id} menu={menu} />
              ))}
            </div>
          </main>

          {/* Right Sidebar */}
          <div className="hidden xl:block xl:w-60 xl:shrink-0">
            <div className="sticky top-[80px] space-y-6">
              <AdBanner position="right" />
              <AdBanner position="right" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Ad */}
      <div className="px-4 pb-8 lg:hidden">
        <AdBanner position="right" className="mx-auto max-w-sm" />
      </div>
    </div>
  );
}
