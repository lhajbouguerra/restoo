"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Minus, Search, Clock, Flame, Users, Star, ShoppingCart } from "lucide-react"
import type { MenuItem, Order } from "@/lib/types"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useLanguage } from "./language-provider"

// IMPORT THE NEW COMPONENT
import { MenuItemCard } from "./MenuItemCard"

const MENU_ITEMS: MenuItem[] = [{ id: "1", name: "Margherita Pizza", price: 12.99, image: "/images/margherita-pizza.jpg", description: "Fresh mozzarella, basil, and tomato sauce", category: "Mains", ingredients: ["Tomato sauce", "Fresh mozzarella", "Basil", "Olive oil", "Pizza dough"], calories: 285, prepTime: 1, servings: 2, rating: 4.8, }, { id: "2", name: "Pepperoni Pizza", price: 14.99, image: "/images/pepperoni-pizza.jpg", description: "Classic pepperoni with melted cheese", category: "Mains", ingredients: ["Tomato sauce", "Mozzarella", "Pepperoni", "Oregano", "Pizza dough"], calories: 320, prepTime: 15, servings: 2, rating: 4.9, }, { id: "3", name: "Burger", price: 10.99, image: "/images/burger.jpg", description: "Juicy beef patty with fresh toppings", category: "Mains", ingredients: ["Beef patty", "Lettuce", "Tomato", "Cheese", "Bun", "Special sauce"], calories: 450, prepTime: 12, servings: 1, rating: 4.7, }, { id: "4", name: "Caesar Salad", price: 9.99, image: "/images/caesar-salad.jpg", description: "Crisp romaine with parmesan and croutons", category: "Starters", ingredients: ["Romaine lettuce", "Parmesan cheese", "Croutons", "Caesar dressing", "Anchovies"], calories: 180, prepTime: 8, servings: 1, rating: 4.6, }, { id: "5", name: "Pasta Carbonara", price: 13.99, image: "/images/pasta-carbonara.jpg", description: "Creamy pasta with bacon and egg", category: "Mains", ingredients: ["Spaghetti", "Bacon", "Eggs", "Parmesan", "Black pepper"], calories: 380, prepTime: 18, servings: 2, rating: 4.8, }, { id: "6", name: "Grilled Salmon", price: 18.99, image: "/images/grilled-salmon.jpg", description: "Fresh salmon fillet with lemon butter", category: "Mains", ingredients: ["Salmon fillet", "Lemon", "Butter", "Herbs", "Asparagus"], calories: 320, prepTime: 20, servings: 1, rating: 4.9, }, { id: "7", name: "Chicken Wings", price: 11.99, image: "/images/chicken-wings.jpg", description: "Crispy wings with spicy sauce", category: "Starters", ingredients: ["Chicken wings", "Spicy sauce", "Garlic", "Paprika", "Herbs"], calories: 280, prepTime: 14, servings: 2, rating: 4.7, }, { id: "8", name: "Tiramisu", price: 7.99, image: "/images/tiramisu.jpg", description: "Classic Italian dessert with mascarpone", category: "Desserts", ingredients: ["Mascarpone", "Ladyfingers", "Espresso", "Cocoa powder", "Egg yolks"], calories: 350, prepTime: 5, servings: 2, rating: 4.9, },]

const CATEGORIES = ["All", "Starters", "Mains", "Desserts", "Drinks"] as const

interface MenuProps {
  onAddToCart: (item: MenuItem) => void
  onGoToCart: () => void
  cartCount: number
}

interface MenuItemState {
  [key: string]: number
}

export default function Menu({ onAddToCart, onGoToCart, cartCount }: MenuProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>("All")
  const [quantities, setQuantities] = useState<MenuItemState>({})
  const [toast, setToast] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({})

  // <-- use query params instead of route params
  const searchParams = useSearchParams()
  const tableParam = searchParams?.get("table")
  const guestId = searchParams?.get("guest")
  const tableNumber = tableParam ? Number(tableParam) : undefined
  const router = useRouter()
  const API_BASE = "https://resto.qzz.io"

  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  useEffect(() => {
    const generateCsrfToken = () => {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      setCsrfToken(token)
      // set cookie as before
      document.cookie = `csrfToken=${token}; path=/; secure; samesite=strict`
    }
    generateCsrfToken()
  }, [])

  useEffect(() => {
    const checkOrder = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Decide URL based on table or guest
        let url = `${API_BASE}/order`
        if (tableParam) url += `?table=${encodeURIComponent(tableParam)}`
        else if (guestId) url += `?guest=${encodeURIComponent(guestId)}`

        // If no identifier, skip check
        if (!tableParam && !guestId) {
          setIsLoading(false)
          return
        }

        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
            // optionally send csrf token in header for extra safety
            ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
          },
        })

        if (res.ok) {
          const data = await res.json()
          // assume backend returns order object or null
          if (data && (data.order_number || data.id)) {
            setActiveOrder(data)
          } else {
            setActiveOrder(null)
          }
        } else {
          // non-200 — not critical, but show message
          setActiveOrder(null)
        }
      } catch (err) {
        console.error(err)
        setError("Network Error. Please try refreshing the page.")
      } finally {
        setIsLoading(false)
      }
    }

    // only check when we have a csrf token (or you can remove that dependency)
    if (csrfToken) {
      checkOrder()
    }
    // run again when tableParam/guestId changes
  }, [tableParam, guestId, csrfToken, API_BASE])

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1
    if (quantity > 0) {
      for (let i = 0; i < quantity; i++) {
        onAddToCart(item)
      }
      setQuantities({ ...quantities, [item.id]: 0 })
      setToast(`${quantity}x ${item.name} ${t("menu.added")}`)
      setTimeout(() => setToast(null), 2000)
    }
  }

  const updateQuantity = useCallback(
    (itemId: string, delta: number) => {
      if (!itemId || typeof delta !== "number") {
        console.error("Invalid input to updateQuantity")
        return
      }
      const current = quantities[itemId] || 0
      const newQuantity = Math.max(0, current + delta)
      const safeQuantity = Math.min(newQuantity, 99)
      setQuantities((prev) => ({ ...prev, [itemId]: safeQuantity }))
    },
    [quantities],
  )

  const handleQuickAdd = useCallback(
    (item: MenuItem) => {
      onAddToCart(item)
      setToast(`1x ${item.name} added!`)
      setTimeout(() => setToast(null), 2000)
    },
    [onAddToCart],
  )

  const handleImageError = useCallback((id: string) => {
    setImageError((prev) => ({ ...prev, [id]: true }))
  }, [])

  return (
    <div>
      {/* Menu Header with Cart Button */}
      <div className="flex justify-between items-start sm:items-center gap-2 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{t("menu.title")}</h2>

        {/* If active order exists, link to progress with query param; else go to confirm (onGoToCart passed from parent) */}
        {activeOrder ? (
          <Button
            onClick={() =>
              tableParam
                ? router.push(`/order/progress?table=${encodeURIComponent(tableParam)}`)
                : router.push(`/order/progress?guest=${encodeURIComponent(guestId ?? "")}`)
            }
            className="w-full w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
          >
            {t("button.view_order")}
          </Button>
        ) : (
          <Button
            onClick={onGoToCart}
            className="relative flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Cart</span>

            {/* Cart count badge */}
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Error message display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder={t("menu.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 bg-card border border-border rounded-lg text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
              aria-label={t("menu.search")}
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6 sm:mb-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Menu categories">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`whitespace-nowrap rounded-full transition-all text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 ${selectedCategory === category
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border text-muted-foreground hover:border-primary hover:text-foreground bg-transparent"
                  }`}
                role="tab"
                aria-selected={selectedCategory === category}
                aria-controls="menu-items"
              >
                {t(`category.${category.toLowerCase()}`)}
              </Button>
            ))}
          </div>

          {/* Menu Grid */}
          <div
            className="grid  sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
            role="grid"
            aria-label="Menu items"
          >
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                activeOrder={!!activeOrder}
                imageError={!!imageError[item.id]}
                onCardClick={setSelectedProduct}
                onQuickAdd={handleQuickAdd}
                onImageError={handleImageError}
              />
            ))}
          </div>

          {/* No Results Message */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-base sm:text-lg">{t("menu.no_results")}</p>
            </div>
          )}
        </>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
          onClick={() => setSelectedProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-title"
        >
          <div
            className="bg-card border border-border rounded-2xl overflow-hidden w-full max-w-sm sm:max-w-md md:max-w-lg transform transition-all duration-300 origin-center max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "iosScaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            }}
          >
            <div className="relative w-full h-48 sm:h-56 md:h-80">
              <Image
                src={imageError[selectedProduct.id] ? "/placeholder.svg" : selectedProduct.image || "/placeholder.svg"}
                alt={selectedProduct.name}
                fill
                style={{ objectFit: "cover" }}
                onError={() => handleImageError(selectedProduct.id)}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 sm:p-2 transition-colors z-10"
                aria-label="Close product details"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Space") {
                    setSelectedProduct(null)
                  }
                }}
              >
                <svg
                  className="w-5 sm:w-6 h-5 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                <h2 id="product-detail-title" className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  {selectedProduct.name}
                </h2>
                <p className="text-gray-200 text-xs sm:text-sm mb-3 sm:mb-4">{selectedProduct.description}</p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <p className="text-xl sm:text-2xl font-bold text-white">DT {selectedProduct.price.toFixed(2)}</p>
                  {selectedProduct.rating && (
                    <div className="flex items-center gap-1 bg-black/50 px-2 sm:px-3 py-1 rounded-full">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs sm:text-sm font-semibold">{selectedProduct.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-card space-y-4 sm:space-y-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {selectedProduct.prepTime && (
                  <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-muted rounded-lg">
                    <Clock size={16} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t("menu.prep_time")}</span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm">
                      {selectedProduct.prepTime}m
                    </span>
                  </div>
                )}
                {selectedProduct.calories && (
                  <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-muted rounded-lg">
                    <Flame size={16} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t("menu.calories")}</span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm">
                      {selectedProduct.calories}
                    </span>
                  </div>
                )}
                {selectedProduct.servings && (
                  <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-muted rounded-lg">
                    <Users size={16} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{t("menu.servings")}</span>
                    <span className="font-semibold text-foreground text-xs sm:text-sm">
                      {selectedProduct.servings}
                    </span>
                  </div>
                )}
              </div>

              {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">{t("menu.ingredients")}</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedProduct.ingredients.map((ingredient, idx) => (
                      <span key={idx} className="bg-muted text-muted-foreground text-xs px-2 sm:px-3 py-1 rounded-full">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3 bg-muted rounded-lg p-2 sm:p-3">
                <Button
                  onClick={() => updateQuantity(selectedProduct.id, -1)}
                  size="sm"
                  variant="outline"
                  className="p-0 h-7 sm:h-8 w-7 sm:w-8 border-border hover:bg-primary/20 text-foreground"
                  disabled={(quantities[selectedProduct.id] || 0) === 0}
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </Button>
                <span
                  className="flex-1 text-center font-semibold text-foreground text-sm sm:text-lg"
                  aria-live="polite"
                >
                  {quantities[selectedProduct.id] || 0}
                </span>
                <Button
                  onClick={() => updateQuantity(selectedProduct.id, 1)}
                  size="sm"
                  variant="outline"
                  className="p-0 h-7 sm:h-8 w-7 sm:w-8 border-border hover:bg-primary/20 text-foreground"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </Button>
              </div>

              <Button
                onClick={() => {
                  handleAddToCart(selectedProduct)
                  setSelectedProduct(null)
                }}
                disabled={(quantities[selectedProduct.id] || 0) === 0 || !!activeOrder}
                className={`w-full font-semibold py-2 sm:py-3 rounded-lg transition-all text-sm sm:text-base flex items-center justify-center gap-2 ${(quantities[selectedProduct.id] || 0) === 0 || !!activeOrder
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
              >
                <Plus size={16} />
                {(quantities[selectedProduct.id] || 0) > 0
                  ? `Add ${quantities[selectedProduct.id]}`
                  : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Component */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeInOut"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}

      {/* Styles for animations */}
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translate(-50%, 10px); }
          10%, 90% { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 2000ms ease-in-out;
        }
        @keyframes iosScaleIn {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(20px);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
