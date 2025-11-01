import { UtensilsCrossed, ShoppingBag } from "lucide-react";

interface Props {
    onDineIn: () => void;
    onTakeaway: () => void;
}

export default function OrderStartPage({ onDineIn, onTakeaway }: Props) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm z-50 p-4">
            <div className="bg-white dark:bg-black rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col gap-8 w-full max-w-md text-center border animate-in fade-in zoom-in duration-300">
                <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Welcome!
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-base">
                        How would you like to enjoy your meal today?
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={onDineIn}
                        className="group relative w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <div className="relative flex items-center justify-center gap-3">
                            <UtensilsCrossed className="w-6 h-6" />
                            <span className="text-lg">Dine In</span>
                        </div>
                        <p className="relative text-sm text-blue-100 mt-1">
                            Enjoy your meal here
                        </p>
                    </button>

                    <button
                        onClick={onTakeaway}
                        className="group relative w-full bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <div className="relative flex items-center justify-center gap-3">
                            <ShoppingBag className="w-6 h-6" />
                            <span className="text-lg">Takeaway</span>
                        </div>
                        <p className="relative text-sm text-emerald-100 mt-1">
                            Order to go
                        </p>
                    </button>
                </div>

                <div className="pt-2 border-t ">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Select your preferred dining option to continue
                    </p>
                </div>
            </div>
        </div>
    );
}