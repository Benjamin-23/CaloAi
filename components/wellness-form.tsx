'use client';

import React from "react"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, RotateCcw } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

interface UserProfile {
  age: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  availableTime: number;
  healthConditions: string[];
  stressLevel: number;
  sleepQuality: number;
  preferences: string[];
  additionalNotes?: string;
}

interface WellnessFormProps {
  onSubmit: (profile: UserProfile) => void;
  loading?: boolean;
}

const fitnessGoals = ['Weight loss', 'Build muscle', 'Improve endurance', 'Increase flexibility', 'Stress relief'];
const healthConditions = ['None', 'Lower back pain', 'Knee issues', 'Asthma', 'High blood pressure', 'Arthritis'];
const preferences = ['No equipment', 'Home-based', 'Outdoors', 'High intensity', 'Low impact'];

export function WellnessForm({ onSubmit, loading = false }: WellnessFormProps) {
  const [age, setAge] = useState(30);
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [goals, setGoals] = useState<string[]>(['Improve endurance']);
  const [availableTime, setAvailableTime] = useState(30);
  const [conditions, setConditions] = useState<string[]>(['None']);
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(6);
  const [prefs, setPrefs] = useState<string[]>(['Home-based']);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Update additional notes when transcript changes
  React.useEffect(() => {
    if (transcript) {
      setAdditionalNotes(prev => {
        // If the previous note ended with text and no space, add a space
        const prefix = prev && !prev.endsWith(' ') ? prev + ' ' : prev;
        // We need to be careful not to duplicate if the transcript updates continuously
        // For simplicity with this hook, we might just append the *new* part or handle it differently.
        // But since transcript accumulates in the hook, let's just use it carefully.
        // Actually, a better pattern with this simple hook is to let the user see the transcript 
        // and manually confirm or have it auto-fill. 
        // Let's assume transcript is the *current session* transcript.
        // We'll append it to a "session start" val if needed, or just let the user edit.
        return prefix + transcript;
      });
      // Reset transcript so we don't keep appending the same thing
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleGoalChange = (goal: string) => {
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  };

  const handleConditionChange = (condition: string) => {
    if (condition === 'None') {
      setConditions(['None']);
    } else {
      const updated = conditions.filter((c) => c !== 'None').includes(condition)
        ? conditions.filter((c) => c !== 'None').filter((c) => c !== condition)
        : [condition];
      setConditions(updated.length > 0 ? updated : ['None']);
    }
  };

  const handlePrefChange = (pref: string) => {
    setPrefs((prev) => (prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      age,
      fitnessLevel,
      goals: goals.length > 0 ? goals : ['Improve endurance'],
      availableTime,
      healthConditions: conditions,
      stressLevel,
      sleepQuality,
      preferences: prefs.length > 0 ? prefs : ['Home-based'],
      additionalNotes: additionalNotes,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Wellness Profile Assessment</CardTitle>
        <CardDescription>
          Help us understand your wellness needs for personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age */}
            <div className="space-y-3">
              <Label>Age: {age}</Label>
              <Slider value={[age]} onValueChange={(v) => setAge(v[0])} min={18} max={80} step={1} className="w-full" />
            </div>

            {/* Fitness Level */}
            <div className="space-y-2">
              <Label htmlFor="fitness">Fitness Level</Label>
              <Select value={fitnessLevel} onValueChange={(v: any) => setFitnessLevel(v)}>
                <SelectTrigger id="fitness">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Available Time */}
            <div className="space-y-3">
              <Label>Available Time per Day: {availableTime} minutes</Label>
              <Slider
                value={[availableTime]}
                onValueChange={(v) => setAvailableTime(v[0])}
                min={10}
                max={120}
                step={5}
                className="w-full"
              />
            </div>

            {/* Stress Level */}
            <div className="space-y-3">
              <Label>Current Stress Level: {stressLevel}/10</Label>
              <Slider
                value={[stressLevel]}
                onValueChange={(v) => setStressLevel(v[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Sleep Quality */}
            <div className="space-y-3">
              <Label>Sleep Quality: {sleepQuality}/10</Label>
              <Slider
                value={[sleepQuality]}
                onValueChange={(v) => setSleepQuality(v[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Empty div for grid alignment if needed, or just let it flow */}
            <div className="hidden md:block"></div>

            {/* Fitness Goals */}
            <div className="space-y-3 md:col-span-2">
              <Label>Fitness Goals (select all that apply)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {fitnessGoals.map((goal) => (
                  <div key={goal} className="flex items-center gap-2">
                    <Checkbox
                      id={goal}
                      checked={goals.includes(goal)}
                      onCheckedChange={() => handleGoalChange(goal)}
                    />
                    <label htmlFor={goal} className="text-sm cursor-pointer">
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Conditions */}
            <div className="space-y-3 md:col-span-2">
              <Label>Health Conditions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {healthConditions.map((condition) => (
                  <div key={condition} className="flex items-center gap-2">
                    <Checkbox
                      id={condition}
                      checked={conditions.includes(condition)}
                      onCheckedChange={() => handleConditionChange(condition)}
                    />
                    <label htmlFor={condition} className="text-sm cursor-pointer">
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-3 md:col-span-2">
              <Label>Preferences (select all that apply)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {preferences.map((pref) => (
                  <div key={pref} className="flex items-center gap-2">
                    <Checkbox
                      id={pref}
                      checked={prefs.includes(pref)}
                      onCheckedChange={() => handlePrefChange(pref)}
                    />
                    <label htmlFor={pref} className="text-sm cursor-pointer">
                      {pref}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes with Voice Input */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "secondary"}
                    size="sm"
                    onClick={toggleListening}
                    className="h-8 gap-2"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-3.5 w-3.5" /> Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5" /> Voice Input
                      </>
                    )}
                  </Button>
                  {transcript && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAdditionalNotes(prev => prev.trim())} // Simple fallback or clear? Let's just have clear if needed, or nothing. 
                    // Actually let's key off resetTranscript if we wanted a clear button but manual edit is fine.
                    >
                      {/* Optional clear button could go here */}
                    </Button>
                  )}
                </div>
              </div>
              <div className="relative">
                <Textarea
                  id="notes"
                  placeholder="Any specific focus areas or limitations? Speak or type..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                {isListening && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-red-500 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Listening...
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Click "Voice Input" to dictate your notes. Browser permission required.
              </p>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Get Wellness Recommendation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
