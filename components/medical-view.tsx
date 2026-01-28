"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { UserProfile } from "@/lib/wellness-engine"
import { MedicalContext, MedicalActionPlan } from "@/lib/medical-engine"
import { Loader2, Stethoscope, ClipboardList, AlertCircle, CalendarPlus } from "lucide-react"

export function MedicalView() {
    const [loading, setLoading] = useState(false)
    const [symptomLog, setSymptomLog] = useState("")
    const [lastCheckup, setLastCheckup] = useState("2024-01-15")
    const [result, setResult] = useState<MedicalActionPlan | null>(null)

    // Default profile demo
    const [profile] = useState<UserProfile>({
        age: 42,
        fitnessLevel: "intermediate",
        goals: ["Longevity"],
        availableTime: 30,
        healthConditions: ["High Blood Pressure"],
        stressLevel: 5,
        sleepQuality: 7,
        preferences: []
    })

    const analyzeHealth = async () => {
        setLoading(true)
        try {
            const context: MedicalContext = {
                symptomLog: symptomLog ? symptomLog.split("\n").filter(s => s) : [],
                lastCheckupDate: lastCheckup
            }

            const res = await fetch("/api/medical", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userProfile: profile,
                    medicalContext: context
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
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Medical Advocate</CardTitle>
                        <CardDescription>
                            We track your history and prepare you for appointments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label>Recent Symptoms (One per line)</Label>
                            <Textarea
                                value={symptomLog}
                                onChange={(e) => setSymptomLog(e.target.value)}
                                placeholder="Headache in evenings&#10;Mild knee pain after running"
                                rows={5}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Last Full Checkup</Label>
                            <Input
                                type="date"
                                value={lastCheckup}
                                onChange={(e) => setLastCheckup(e.target.value)}
                            />
                        </div>

                        <Button onClick={analyzeHealth} disabled={loading} className="w-full">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Consulting Knowledge Base..." : "Analyze & Plan"}
                        </Button>
                    </CardContent>
                </Card>

                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    <strong>Privacy Note:</strong> Your health data is processed securely and is not shared with third parties without consent.
                </div>
            </div>

            <div className="space-y-6">
                {result ? (
                    <div className="space-y-6">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-blue-500" />
                                    Your Care Plan
                                </CardTitle>
                                <CardDescription>{result.symptomAnalysis}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 p-3 bg-card border rounded-md font-medium">
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                    Action: {result.suggestedAction}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Preventive Screenings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {result.screeningsNeeded.map((screen, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border bg-muted/30">
                                        <div>
                                            <div className="font-semibold">{screen.name}</div>
                                            <div className="text-xs text-muted-foreground">{screen.reason}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${screen.urgency === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {screen.urgency}
                                            </span>
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                                <CalendarPlus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {result.questionsForDoctor.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ClipboardList className="h-4 w-4" />
                                        Questions for Doctor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        {result.questionsForDoctor.map((q, i) => (
                                            <li key={i}>{q}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                        <Stethoscope className="h-12 w-12 mb-4 opacity-20" />
                        <p>Log symptoms or checkups to get personalized medical advocacy.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
