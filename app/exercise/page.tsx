import { ExerciseView } from "@/components/exercise-view"

export default function ExercisePage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Exercise More</h1>
                <p className="text-muted-foreground">Proactive workout scheduling that adapts to your life.</p>
            </div>
            <ExerciseView />
        </div>
    )
}
