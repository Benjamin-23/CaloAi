import { MedicalView } from "@/components/medical-view"

export default function MedicalPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Medical Advocate</h1>
                <p className="text-muted-foreground">Proactive health management and preventive screening.</p>
            </div>
            <MedicalView />
        </div>
    )
}
