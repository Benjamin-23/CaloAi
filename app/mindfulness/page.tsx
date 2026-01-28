import { MindfulnessView } from "@/components/mindfulness-view"

export default function MindfulnessPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Mindfulness & Balance</h1>
                <p className="text-muted-foreground">AI-driven stress detection and real-time intervention.</p>
            </div>
            <MindfulnessView />
        </div>
    )
}
