"use client"

import { useLanguage } from "./language-provider"
import { Button } from "./ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu"

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg border border-border shadow-sm
                     bg-linear-to-r from-emerald-600 to-emerald-700 
                     dark:from-blue-600 dark:to-blue-700
                     hover:from-emerald-700 hover:to-emerald-800 
                     dark:hover:from-blue-700 dark:hover:to-blue-800
                     text-white transition-all duration-300 ease-in-out"
          aria-label="Select language"
        >
          {language}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-card border border-border shadow-lg rounded-lg "
      >
        {(["en", "ar", "fr"] as const).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`
              dark:text-white
              flex justify-between items-center px-3 py-2 rounded-md
              transition-all duration-200
              hover:bg-linear-to-r from-emerald-600 to-emerald-700
              dark:hover:from-blue-600 dark:hover:to-blue-700
              
              ${language === lang ? "font-bold dark:text-white " : ""}
            `}
          >
            {t(`language.${lang}`)}
            {language === lang && <span className="ml-2 text-green-400">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
