import { NutritionView } from "@/components/nutrition-view"

export default function NutritionPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Eat Healthier</h1>
                <p className="text-muted-foreground">Smart meal planning based on your pantry and goals.</p>
            </div>
            <NutritionView />
        </div>
    )
}
