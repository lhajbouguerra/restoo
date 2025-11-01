import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
interface Props {
    onDineIn: () => void;
    onTakeaway: () => void;
}
export default function OrderStartPage({ onDineIn, onTakeaway }: Props) {
    return (
        <Card className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 ">
            <div className="bg-card rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col gap-6 w-full max-w-sm text-center border">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Welcome!</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Please choose how you’d like to order.
                </p>
                <Button
                    onClick={onDineIn}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all text-lg flex items-center justify-center gap-2"
                >
                    on place
                </Button>
                <Button
                    onClick={onTakeaway}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-3 rounded-lg transition-all text-lg flex items-center justify-center gap-2"
                >
                    Takeaway
                </Button>
            </div>
        </Card>

    );
}
