"use client"

import { useLanguage } from "./language-provider"
import ThemeToggle from "./theme-toggle"
import LanguageSelector from "./language-selector"
import { Utensils } from "lucide-react"
import Link from "next/link"

export default function Header() {
  const { t } = useLanguage()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm flex items-center justify-center transition-shadow duration-300">
      <div className="container flex h-16 sm:h-14 items-center justify-between px-4 sm:px-6">
        
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <Utensils className="h-6 w-6 text-primary transition-transform duration-300 hover:rotate-20 hover:text-primary/80" />
          <Link
            href="/order"
            className="font-bold text-lg sm:text-xl bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 transition-all duration-300"
          >
            {t("app.title")}
          </Link>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
