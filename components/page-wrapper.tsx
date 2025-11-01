"use client"

import { motion } from "framer-motion"
import { useLanguage } from "./language-provider"

interface PageWrapperProps {
  children: React.ReactNode
  title?: string
}

export default function PageWrapper({ children, title }: PageWrapperProps) {
  const { t } = useLanguage()
  
  return (
    <div className="container py-6 md:py-8">
      {title && (
        <motion.h1 
          className="text-2xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {t(title)}
        </motion.h1>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  )
}