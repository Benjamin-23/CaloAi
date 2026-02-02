"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { UserProfile } from "@/lib/wellness-engine"
import { NutritionContext, MealPlan } from "@/lib/nutrition-engine"
import { useAuth } from "@/hooks/use-auth"
import { Loader2, Utensils, ShoppingCart, Check } from "lucide-react"

export function NutritionView() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [fridgeInput, setFridgeInput] = useState("Eggs, Spinach, Milk, Chicken Breast, Rice, Tomatoes")
    const [mealsToPlan, setMealsToPlan] = useState(3)
    const [result, setResult] = useState<MealPlan | null>(null)
    const [ordered, setOrdered] = useState(false)

    // Default profile demo
    const [profile] = useState<UserProfile>({
        age: 30,
        fitnessLevel: "intermediate",
        goals: ["Weight loss", "Eat Healthier"],
        availableTime: 45,
        healthConditions: [],
        stressLevel: 4,
        sleepQuality: 7,
        preferences: ["Low carb", "Mediterranean"]
    })

    const generatePlan = async () => {
        setLoading(true)
        setOrdered(false)
        try {
            const context: NutritionContext = {
                fridgeContents: fridgeInput.split(",").map(s => s.trim()),
                mealsToPlan,
                dietaryRestrictions: ["None"]
            }

            const res = await fetch("/api/nutrition", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userProfile: profile,
                    nutritionContext: context,
                    userId: user?.id
                })
            })

            const data = await res.json()
            if (data.success) {
                setResult(data.result)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleOrder = () => {
        setOrdered(true)
        // Simulation
        setTimeout(() => setOrdered(false), 3000)
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Fridge Tracker & Meal Plans</CardTitle>
                        <CardDescription>
                            We analyze what you have and plan what you need.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label>What's in your fridge? (separated by commas)</Label>
                            <Textarea
                                value={fridgeInput}
                                onChange={(e) => setFridgeInput(e.target.value)}
                                placeholder="Eggs, Milk, Spinach..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Meals to Plan: {mealsToPlan}</Label>
                            <Slider
                                value={[mealsToPlan]}
                                onValueChange={(v) => setMealsToPlan(v[0])}
                                min={1} max={7} step={1}
                            />
                        </div>

                        <Button onClick={generatePlan} disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Chef is thinking..." : "Generate Menu"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {result ? (
                    <>
                        <Card className="border-emerald-500/20 bg-emerald-50/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Utensils className="h-5 w-5 text-emerald-600" />
                                    {result.planName}
                                </CardTitle>
                                <CardDescription>{result.nutritionalSummary}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {result.meals.map((meal, i) => (
                                    <div key={i} className="p-4 rounded-lg border bg-card/80">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold">{meal.name}</h4>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{meal.calories} kcal</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2 italic">
                                            {meal.instructions}
                                        </p>
                                        <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                            Using: {meal.ingredients.join(", ")}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {result.groceryList.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        Grocery List
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                                        {result.groceryList.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                    <Button onClick={handleOrder} disabled={ordered} variant="outline" className="w-full">
                                        {ordered ? (
                                            <>
                                                <Check className="mr-2 h-4 w-4 text-green-500" />
                                                Ordered via Instacart
                                            </>
                                        ) : "Order Missing Items"}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                        <Utensils className="h-12 w-12 mb-4 opacity-20" />
                        <p>Tell us what's in your kitchen to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
