"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Language = "en" | "ar" | "fr" 

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    "app.title": "RestoApp",
    "menu.title": "Menu",
    "order.title": "Your Order",
    "scan.title": "Scan QR Code",
    "button.cancel": "Cancel",
    "button.add": "Add",
    "button.remove": "Remove",
    "button.continue": "Continue",
    "button.back": "Back",
    "button.confirm": "Confirm Order",
    "button.view_order": "View Order",
    "button.confirm_send": "Confirm & Send Order",
    "button.close_order": "Close Order",
    "button.back_to_menu": "Back to Menu",
    "button.menu":"menu",
    "language.en": "English",
    "language.ar": "العربية",
    "language.fr": "Français",
    "language.es": "Español",
    "menu.search": "Search menu...",
    "menu.no_results": "No items found matching your search.",
    "menu.ingredients": "Ingredients",
    "menu.add_to_cart": "Add to Cart",
    "menu.prep_time": "Prep",
    "menu.calories": "Cal",
    "menu.servings": "Serves",
    "menu.added": "added!",
    "menu.confirm": "Confirm",
    "category.all": "All",
    "category.starters": "Starters",
    "category.mains": "Mains",
    "category.desserts": "Desserts",
    "category.drinks": "Drinks",
    "order.cart_empty": "Your cart is empty",
    "order.cart_empty_message": "Go back to the menu to add items to your order.",
    "order.table_order": "Table {0} Order",
    "order.takeaway_order": "Takeaway Order",
    "order.total": "Total:",
    "order.each": "each",
    "order.items_ordered": "Items Ordered",
    "order.order_sent": "Sent!",
    "order.closing_order": "Closing Order...",
    "order.confirm_close": "Confirm Close Order",
    "order.confirm_close_message": "Are you sure you want to close this order? This action cannot be undone.",
    "order.network_error": "Network error. Please try again.",
    "order.order_confirmed": "Order confirmed successfully!",
    "order.failed_confirm": "Failed to confirm order"
  },

    fr: {
    "app.title": "RestoApp",
    "menu.title": "Menu",
    "order.title": "Votre commande",
    "scan.title": "Scanner le QR Code",
    "button.add": "Ajouter",
    "button.cancel": "Annuler",
    "button.remove": "Supprimer",
    "button.continue": "Continuer",
    "button.back": "Retour",
    "button.confirm": "Confirmer la commande",
    "button.view_order": "Voir la commande",
    "button.confirm_send": "Confirmer & Envoyer la commande",
    "button.close_order": "Anuler la commande",
    "button.back_to_menu": "Retour au menu",
    "button.menu": "menu",
    "language.en": "Anglais",
    "language.ar": "Arabe",
    "language.fr": "Français",
    "language.es": "Espagnol",
    "menu.search": "Rechercher dans le menu...",
    "menu.no_results": "Aucun élément ne correspond à votre recherche.",
    "menu.ingredients": "Ingrédients",
    "menu.add_to_cart": "Ajouter au panier",
    "menu.prep_time": "Préparation",
    "menu.calories": "Cal",
    "menu.servings": "Pour",
    "menu.added": "ajouté !",
    "menu.confirm": "Confirmer",
    "category.all": "Tout",
    "category.starters": "Entrées",
    "category.mains": "Plats principaux",
    "category.desserts": "Desserts",
    "category.drinks": "Boissons",
    "order.cart_empty": "Votre panier est vide",
    "order.cart_empty_message": "Retournez au menu pour ajouter des articles à votre commande.",
    "order.table_order": "Commande de la table {0}",
    "order.takeaway_order": "Commande à emporter",
    "order.total": "Total :",
    "order.each": "chacun",
    "order.items_ordered": "Articles commandés",
    "order.order_sent": "Envoyé !",
    "order.closing_order": "Fermeture de la commande...",
    "order.confirm_close": "Confirmer la clôture de la commande",
    "order.confirm_close_message": "Êtes-vous sûr de vouloir clore cette commande ? Cette action est irréversible.",
    "order.network_error": "Erreur réseau. Veuillez réessayer.",
    "order.order_confirmed": "Commande confirmée avec succès !",
    "order.failed_confirm": "Échec de la confirmation de la commande"
  },
  ar: {
    "app.title": "ريستو أب",
    "menu.title": "القائمة",
    "order.title": "طلبك",
    "scan.title": "مسح رمز QR",
    "button.cancel": "إلغاء",
    "button.add": "إضافة",
    "button.remove": "إزالة",
    "button.continue": "متابعة",
    "button.back": "رجوع",
    "button.confirm": "تأكيد الطلب",
    "button.view_order": "عرض الطلب",
    "button.confirm_send": "تأكيد وإرسال الطلب",
    "button.close_order": "إغلاق الطلب",
    "button.back_to_menu": "العودة إلى القائمة",
    "button.menu": "القائمة",
    "language.en": "الإنجليزية",
    "language.ar": "العربية",
    "language.fr": "الفرنسية",
    "language.es": "الإسبانية",
    "menu.search": "ابحث في القائمة...",
    "menu.no_results": "لم يتم العثور على عناصر تطابق بحثك.",
    "menu.ingredients": "المكونات",
    "menu.add_to_cart": "أضف إلى السلة",
    "menu.prep_time": "التحضير",
    "menu.calories": "سعرات",
    "menu.servings": "عدد الحصص",
    "menu.added": "تم الإضافة!",
    "menu.confirm": "تأكيد",
    "category.all": "الكل",
    "category.starters": "المقبلات",
    "category.mains": "الأطباق الرئيسية",
    "category.desserts": "الحلويات",
    "category.drinks": "المشروبات",
    "order.cart_empty": "سلتك فارغة",
    "order.cart_empty_message": "ارجع إلى القائمة لإضافة عناصر إلى طلبك.",
    "order.table_order": "طلب الطاولة {0}",
    "order.takeaway_order": "طلب للتيك أواي",
    "order.total": "المجموع:",
    "order.each": "لكل واحد",
    "order.items_ordered": "العناصر المطلوبة",
    "order.order_sent": "تم الإرسال!",
    "order.closing_order": "جاري إغلاق الطلب...",
    "order.confirm_close": "تأكيد إغلاق الطلب",
    "order.confirm_close_message": "هل أنت متأكد أنك تريد إغلاق هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه.",
    "order.network_error": "خطأ في الشبكة. حاول مرة أخرى.",
    "order.order_confirmed": "تم تأكيد الطلب بنجاح!",
    "order.failed_confirm": "فشل في تأكيد الطلب"
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within LanguageProvider")
  return context
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    setMounted(true)
    
    // Load stored preference
    const storedLanguage = localStorage.getItem("language") as Language | null
    
    if (storedLanguage && Object.keys(translations).includes(storedLanguage)) {
      setLanguageState(storedLanguage)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0]
      const supportedLang = Object.keys(translations).includes(browserLang) 
        ? browserLang as Language 
        : "en"
      
      setLanguageState(supportedLang)
      localStorage.setItem("language", supportedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
    
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang
    
    // For RTL languages like Arabic
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
  }

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
  }

  if (!mounted) return null

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}