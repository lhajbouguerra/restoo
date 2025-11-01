"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"
interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>("light")
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setMounted(true)

    const htmlElement = document.documentElement

    // Load stored preference
    const storedTheme = localStorage.getItem("theme") as Theme | null
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (storedTheme) {
      setTheme(storedTheme)
      htmlElement.dataset.theme = storedTheme
      htmlElement.classList.toggle("dark", storedTheme === "dark")
    } else {
      const initialTheme: Theme = systemPrefersDark ? "dark" : "light"
      setTheme(initialTheme)
      htmlElement.dataset.theme = initialTheme
      htmlElement.classList.toggle("dark", initialTheme === "dark")
    }

    // Listen for system changes only if no user override
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("theme")
      if (!stored) {
        const newTheme: Theme = e.matches ? "dark" : "light"
        applyTheme(newTheme)
      }
    }

    mediaQuery.addEventListener("change", handleSystemChange)
    return () => mediaQuery.removeEventListener("change", handleSystemChange)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    setIsTransitioning(true)
    setTheme(newTheme)
    document.documentElement.dataset.theme = newTheme
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    localStorage.setItem("theme", newTheme)
    
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light"
    applyTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
