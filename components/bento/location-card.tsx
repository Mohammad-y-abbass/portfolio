import { MapPin } from "lucide-react"
import { CardShell } from "./card-shell"

export function LocationCard() {
  return (
    <CardShell className="p-6 md:p-7 flex flex-col">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
        <MapPin className="size-3" aria-hidden />
        Location
      </div>
      <h3 className="text-lg font-medium tracking-tight">Live in Beirut.</h3>

      <div className="mt-auto flex items-center justify-between pt-6">
        <div className="font-mono text-xs text-muted-foreground">
          33.8938° N, 35.5018° E
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full size-2.5 bg-brand" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
            Online
          </span>
        </div>
      </div>
    </CardShell>
  )
}
