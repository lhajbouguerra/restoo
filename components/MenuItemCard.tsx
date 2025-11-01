"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { MenuItem } from "@/lib/types"
import Image from "next/image"
import { useInView } from "react-intersection-observer"
import { useLanguage } from "./language-provider"

interface MenuItemCardProps {
  item: MenuItem
  activeOrder: boolean
  imageError: boolean
  onCardClick: (item: MenuItem) => void
  onQuickAdd: (item: MenuItem) => void
  onImageError: (id: string) => void
}

export function MenuItemCard({
  item,
  activeOrder,
  imageError,
  onCardClick,
  onQuickAdd,
  onImageError,
}: MenuItemCardProps) {
  const { t } = useLanguage()
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <Card
      ref={ref}
      onClick={() => onCardClick(item)}
      className={`flex flex-row bg-white dark:bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      role="gridcell"
      tabIndex={0}
      aria-label={`${item.name}, DT ${item.price.toFixed(2)}`}
    >
      <div className="flex items-start gap-4 w-full">
        {/* Image */}
        <div className="relative w-[140px] h-[150px] overflow-hidden rounded-xl flex-shrink-0">
          <Image
            src={imageError ? "/placeholder.svg" : item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover"
            onError={() => onImageError(item.id)}
          />
        </div>

        {/* Info & Actions */}
        <div className="flex flex-col justify-between flex-1 min-w-0 h-[150px]">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
              {item.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>

          {/* Price & Add Button always at bottom */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-base sm:text-xl font-bold text-primary">
              DT {item.price.toFixed(2)}
            </p>
            <Button
              size="icon"
              variant="outline"
              className="bg-black dark:bg-white h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-white dark:text-black border-none shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                if (!activeOrder) onQuickAdd(item)
              }}
              disabled={activeOrder}
              aria-label={`Add ${item.name}`}
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
