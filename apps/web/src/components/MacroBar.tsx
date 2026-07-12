interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: string;
}

export function MacroBar({ label, value, target, unit = 'g', color = '#22c55e' }: MacroBarProps) {
  const pct = Math.min(100, target > 0 ? (value / target) * 100 : 0);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span>{label}</span>
        <span>{Math.round(value)}{unit} / {Math.round(target)}{unit}</span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: 6, height: 8 }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 6, height: 8, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}
