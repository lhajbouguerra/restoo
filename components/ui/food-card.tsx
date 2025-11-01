"use client"

import { Card, CardContent, CardFooter } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"
import { Plus } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useLanguage } from "../language-provider"

interface FoodCardProps {
  id: string
  name: string
  description: string
  price: string
  image: string
  category?: string
  onAdd: () => void
}

export default function FoodCard({ 
  id, 
  name, 
  description, 
  price, 
  image, 
  category,
  onAdd 
}: FoodCardProps) {
  const { t } = useLanguage()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          {category && (
            <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">
              {category}
            </Badge>
          )}
        </div>
        <CardContent className="flex-1 p-4">
          <h3 className="font-semibold text-lg mb-1">{name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <span className="font-medium">{price}</span>
          <Button 
            size="sm" 
            onClick={onAdd}
            aria-label={`${t("button.add")} ${name}`}
          >
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t("button.add")}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}