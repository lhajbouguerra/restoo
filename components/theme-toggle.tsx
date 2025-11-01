"use client"

import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full border border-border shadow-sm p-1
                 bg-linear-to-r from-emerald-600 to-emerald-700 
                 dark:from-blue-600 dark:to-blue-700 
                 hover:from-emerald-700 hover:to-emerald-800 
                 dark:hover:from-blue-700 dark:hover:to-blue-800
                 transition-all duration-300 ease-in-out"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <motion.div 
          key="moon" 
          initial={{ rotate: 0 }} 
          animate={{ rotate: 360 }} 
          transition={{ duration: 0.5 }}
        >
          <Moon className="h-5 w-5 text-white" />
        </motion.div>
      ) : (
        <motion.div 
          key="sun" 
          initial={{ rotate: 0 }} 
          animate={{ rotate: 360 }} 
          transition={{ duration: 0.5 }}
        >
          <Sun className="h-5 w-5 text-white" />
        </motion.div>
      )}
    </Button>
  )
}
