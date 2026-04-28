import type { AppMode } from '../store';

const modes = [
  { id: 'daily' as AppMode, emoji: '💸', title: 'Daily Lending', desc: 'Track who owes you and who you owe.', color: '#0ff' },
  { id: 'trips' as AppMode, emoji: '✈️', title: 'Trips', desc: 'Split group expenses for a trip or event.', color: '#bf5af2' },
];

export default function ModeSelector({ onSelect }: { onSelect: (m: AppMode) => void }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <p style={{ fontSize: 10, color: '#666', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>NovaSplit</p>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>What are you splitting today?</h1>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>Choose a mode to get started.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {modes.map(m => (
            <div key={m.id} className="card" onClick={() => onSelect(m.id)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderLeft: `3px solid ${m.color}` }}>
              <span style={{ fontSize: 28 }}>{m.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{m.title}</p>
                <p style={{ fontSize: 12, color: '#666' }}>{m.desc}</p>
              </div>
              <span style={{ color: m.color, fontSize: 18 }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
