const LEGEND_ITEMS = [
  { label: "Wolne", swatchClassName: "bg-muted border-muted-foreground/30" },
  { label: "Twój wybór", swatchClassName: "bg-primary border-primary/50" },
  { label: "Zablokowane", swatchClassName: "bg-warning border-warning/50" },
  {
    label: "Sprzedane",
    swatchClassName: "bg-destructive border-destructive/50",
  },
] as const;

export function SeatLegend() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
      {LEGEND_ITEMS.map(({ label, swatchClassName }) => (
        <li key={label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-3 w-3 rounded-sm border ${swatchClassName}`}
          />
          {label}
        </li>
      ))}
    </ul>
  );
}
