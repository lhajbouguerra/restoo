"use client"

import { Loader2 } from "lucide-react"
import { useLanguage } from "../language-provider"

interface LoadingProps {
  text?: string
  size?: "sm" | "md" | "lg"
}

export default function Loading({ text, size = "md" }: LoadingProps) {
  const { t } = useLanguage()
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{t(text)}</p>}
    </div>
  )
}