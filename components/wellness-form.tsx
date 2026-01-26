'use client';

import React from "react"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

interface UserProfile {
  age: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  availableTime: number;
  healthConditions: string[];
  stressLevel: number;
  sleepQuality: number;
  preferences: string[];
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
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Wellness Profile Assessment</CardTitle>
        <CardDescription>
          Help us understand your wellness needs for personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Fitness Goals */}
          <div className="space-y-3">
            <Label>Fitness Goals (select all that apply)</Label>
            <div className="space-y-2">
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

          {/* Health Conditions */}
          <div className="space-y-3">
            <Label>Health Conditions</Label>
            <div className="space-y-2">
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

          {/* Preferences */}
          <div className="space-y-3">
            <Label>Preferences (select all that apply)</Label>
            <div className="space-y-2">
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

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Generating...' : 'Get Wellness Recommendation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
