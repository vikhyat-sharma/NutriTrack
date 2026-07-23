interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: string;
}

export function MacroBar({ label, value, target, unit = 'g', color = '#22c55e' }: MacroBarProps) {
  const pct = Math.min(100, target > 0 ? (value / target) * 100 : 0);
  const rounded = Math.round(value);
  const roundedTarget = Math.round(target);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span id={`macro-label-${label}`}>{label}</span>
        <span aria-hidden="true">{rounded}{unit} / {roundedTarget}{unit}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={roundedTarget}
        aria-label={`${label}: ${rounded}${unit} of ${roundedTarget}${unit}`}
        aria-labelledby={`macro-label-${label}`}
        style={{ background: '#e5e7eb', borderRadius: 6, height: 8 }}
      >
        <div
          aria-hidden="true"
          style={{ width: `${pct}%`, background: color, borderRadius: 6, height: 8, transition: 'width 0.3s' }}
        />
      </div>
    </div>
  );
}
