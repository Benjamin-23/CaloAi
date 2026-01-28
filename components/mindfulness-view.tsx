"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { UserProfile } from "@/lib/wellness-engine"
import { StressContext, MindfulnessIntervention } from "@/lib/mindfulness-engine"
import { Loader2, Brain, Activity, Volume2, Play, Pause } from "lucide-react"

export function MindfulnessView() {
    const [loading, setLoading] = useState(false)

    // Simulation Inputs
    const [calendarDensity, setCalendarDensity] = useState<'high' | 'medium' | 'low'>('high')
    const [typingSpeed, setTypingSpeed] = useState<'normal' | 'fast' | 'erratic'>('erratic')
    const [deviceScore, setDeviceScore] = useState(65)

    const [result, setResult] = useState<MindfulnessIntervention | null>(null)

    // Audio State
    const [isPlaying, setIsPlaying] = useState(false)

    // Default profile demo
    const [profile] = useState<UserProfile>({
        age: 30,
        fitnessLevel: "intermediate",
        goals: ["Stress relief"],
        availableTime: 15,
        healthConditions: [],
        stressLevel: 7, // User reported
        sleepQuality: 6,
        preferences: ["Breathing"]
    })

    const checkStatus = async () => {
        setLoading(true)
        setResult(null)
        stopAudio()

        try {
            const context: StressContext = {
                calendarDensity,
                typingSpeed,
                connectedDeviceScore: deviceScore,
                currentTime: new Date().toLocaleTimeString()
            }

            const res = await fetch("/api/mindfulness", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userProfile: profile,
                    stressContext: context
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

    const playAudio = (text: string) => {
        if (!window.speechSynthesis) return;

        // Stop any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for soothing effect
        utterance.pitch = 0.9;

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        setIsPlaying(true);
        window.speechSynthesis.speak(utterance);
    }

    const stopAudio = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        }
    }

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Stress Detox & Monitoring</CardTitle>
                        <CardDescription>
                            We monitor digital signals to detect stress before you burn out.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label>Calendar Density (Simulated)</Label>
                            <Select value={calendarDensity} onValueChange={(v: any) => setCalendarDensity(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low (Few meetings)</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High (Back-to-back)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>Typing Speed/Errors (Simulated)</Label>
                            <Select value={typingSpeed} onValueChange={(v: any) => setTypingSpeed(v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="normal">Normal Flow</SelectItem>
                                    <SelectItem value="fast">Fast / Rushed</SelectItem>
                                    <SelectItem value="erratic">Erratic / Many Errors</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>Oura Readiness Score: {deviceScore}</Label>
                            <Slider
                                value={[deviceScore]}
                                onValueChange={(v) => setDeviceScore(v[0])}
                                min={0} max={100} step={1}
                            />
                            <p className="text-xs text-muted-foreground">Lower score = Higher physiological stress</p>
                        </div>

                        <Button onClick={checkStatus} disabled={loading} className="w-full" variant={result ? "secondary" : "default"}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Analyzing Signals..." : "Check Stress Signals"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {result ? (
                    <Card className="border-pink-500/20 bg-pink-50/10 overflow-hidden relative transition-all duration-500">
                        <div className={`absolute inset-0 bg-pink-500/5 transition-opacity duration-1000 ${result.detectedStressState === 'stressed' || result.detectedStressState === 'overwhelmed' ? 'opacity-100' : 'opacity-0'}`} />

                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2 mb-2">
                                        <Brain className="h-5 w-5 text-pink-500" />
                                        State: {result.detectedStressState.toUpperCase()}
                                    </CardTitle>
                                    <CardDescription>{result.title}</CardDescription>
                                </div>
                                {result.audioPrompt && (
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="rounded-full h-10 w-10 border-pink-200 hover:bg-pink-100 dark:hover:bg-pink-900/20"
                                        onClick={() => isPlaying ? stopAudio() : playAudio(result.audioPrompt)}
                                    >
                                        {isPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 relative z-10">
                            <p className="text-lg font-medium leading-relaxed">
                                "{result.description}"
                            </p>

                            {result.steps && result.steps.length > 0 && (
                                <div className="bg-background/50 p-4 rounded-lg space-y-2">
                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Guidance</h4>
                                    <ul className="space-y-2">
                                        {result.steps.map((step, i) => (
                                            <li key={i} className="flex gap-3 text-sm">
                                                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                                <Activity className="h-3 w-3" />
                                Intervention Duration: {result.durationSeconds}s
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                        <Activity className="h-12 w-12 mb-4 opacity-20" />
                        <p>Ready to analyze your biometric and digital signals.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
