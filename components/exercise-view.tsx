"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { UserProfile } from "@/lib/wellness-engine"
import { ScheduledWorkout, ScheduleContext } from "@/lib/exercise-engine"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { motion } from "framer-motion"
import Image from "next/image"
import { Loader2, Calendar, CheckCircle } from "lucide-react"

export function ExerciseView() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [missedWorkouts, setMissedWorkouts] = useState(1)
    const [result, setResult] = useState<ScheduledWorkout | null>(null)

    // Default profile for demo
    const [profile] = useState<UserProfile>({
        age: 30,
        fitnessLevel: "intermediate",
        goals: ["Improve endurance", "Weight loss"],
        availableTime: 45,
        healthConditions: [],
        stressLevel: 4,
        sleepQuality: 7,
        preferences: ["High intensity", "Outdoors"]
    })

    const [availableSlots, setAvailableSlots] = useState<string[]>([
        "Monday 07:00 AM",
        "Wednesday 06:00 PM",
        "Friday 07:00 AM"
    ])

    const generateSchedule = async () => {
        setLoading(true)
        try {
            const scheduleContext: ScheduleContext = {
                currentDate: new Date().toDateString(),
                availableSlots,
                missedWorkouts,
                lastWorkoutDate: "3 days ago"
            }

            const res = await fetch("/api/exercise", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userProfile: profile,
                    scheduleContext,
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 gap-8"
        >
            <div className="space-y-6">
                <Card className="overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                        <Image
                            src="/images/schedule.png"
                            alt="Schedule Background"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <CardHeader>
                        <CardTitle>Schedule & Recovery</CardTitle>
                        <CardDescription>
                            We'll adjust your plan based on missed sessions and availability.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label>Missed Workouts This Week: {missedWorkouts}</Label>
                            <Slider
                                value={[missedWorkouts]}
                                onValueChange={(v) => setMissedWorkouts(v[0])}
                                min={0} max={5} step={1}
                            />
                            <p className="text-sm text-muted-foreground">
                                We'll automatically adjust intensity to prevent burnout.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label>Available Slots</Label>
                            <div className="grid gap-2">
                                {[
                                    "Monday 07:00 AM",
                                    "Tuesday 06:00 PM",
                                    "Wednesday 06:00 PM",
                                    "Thursday 07:00 AM",
                                    "Friday 07:00 AM",
                                    "Saturday 10:00 AM"
                                ].map((slot) => (
                                    <motion.div
                                        key={slot}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={slot}
                                            checked={availableSlots.includes(slot)}
                                            onCheckedChange={(checked) => {
                                                if (checked) setAvailableSlots([...availableSlots, slot])
                                                else setAvailableSlots(availableSlots.filter(s => s !== slot))
                                            }}
                                        />
                                        <label htmlFor={slot} className="text-sm cursor-pointer select-none">{slot}</label>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <Button onClick={generateSchedule} disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Optimizing Schedule..." : "Generate Adaptive Plan"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {result ? (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="h-full border-primary/20 bg-muted/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    {result.planName}
                                </CardTitle>
                                <CardDescription>{result.rationale}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {result.adjustmentNote && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-3 rounded-md text-sm border border-yellow-500/20"
                                    >
                                        <strong>Adjustment:</strong> {result.adjustmentNote}
                                    </motion.div>
                                )}

                                <div className="space-y-4">
                                    {result.schedule.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                                        >
                                            <div className="min-w-[80px] text-sm font-medium text-muted-foreground">
                                                {item.day}<br />{item.time}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h4 className="font-semibold text-foreground">{item.activity}</h4>
                                                <p className="text-sm text-muted-foreground">{item.duration} mins • {item.bookingAction.replace('_', ' ')}</p>
                                            </div>
                                            <div>
                                                {item.bookingAction === 'book_class' && (
                                                    <div className="px-2 py-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded text-xs font-semibold">
                                                        Booked
                                                    </div>
                                                )}
                                                {item.bookingAction === 'set_reminder' && (
                                                    <div className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-semibold">
                                                        Reminder Set
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-gradient-to-br from-white/50 to-purple-50/30 dark:from-black/20 dark:to-purple-900/10"
                    >
                        <div className="relative w-64 h-64 mb-6">
                            <Image
                                src="/images/workout.png"
                                alt="Workout Illustration"
                                fill
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-primary">Ready to Sweat?</h3>
                        <p className="max-w-sm">Configure your schedule and missed workouts to generate a personalized adaptive plan just for you.</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
