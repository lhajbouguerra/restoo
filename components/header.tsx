"use client"

import { useLanguage } from "./language-provider"
import ThemeToggle from "./theme-toggle"
import LanguageSelector from "./language-selector"
import { Utensils } from "lucide-react"
import Link from "next/link"

export default function Header() {
  const { t } = useLanguage()
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center pr-4 pl-4">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 ">
          <Utensils className="h-5 w-5" />
          <Link href="/order" className="font-medium">{t("app.title")}</Link>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle  />
        </div>
      </div>
    </header>
  )
}