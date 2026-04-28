import { motion, AnimatePresence } from 'framer-motion'
import type { Lend } from '../store'

type Props = {
  lends: Lend[]
  onSettle: (id: number) => void
}

export default function DailyActivity({ lends, onSettle }: Props) {
  const unsettled = lends.filter(l => !l.settled)
  const settled = lends.filter(l => l.settled)

  // totals for the summary cards
  let totalOwedToMe = 0
  let totalIOwe = 0
  for (const l of unsettled) {
    if (l.direction === 'i-lent') totalOwedToMe += l.amount
    else totalIOwe += l.amount
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="screen"
    >
      <p className="section-label" style={{ marginBottom: 16 }}>
        Activity · {unsettled.length} pending
      </p>

      {/* summary */}
      {unsettled.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.12)', borderRadius: 12, padding: '10px 14px' }}>
            <p className="section-label" style={{ color: 'var(--cyan)', marginBottom: 4 }}>Owed to you</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--cyan)' }}>
              ₹{totalOwedToMe.toLocaleString('en-IN')}
            </p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,45,85,0.04)', border: '1px solid rgba(255,45,85,0.12)', borderRadius: 12, padding: '10px 14px' }}>
            <p className="section-label" style={{ color: 'var(--red)', marginBottom: 4 }}>You owe</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)' }}>
              ₹{totalIOwe.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* unsettled lends */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <AnimatePresence>
          {unsettled.map((lend, i) => (
            <LendCard key={lend.id} lend={lend} index={i} onSettle={onSettle} />
          ))}
        </AnimatePresence>
        {unsettled.length === 0 && (
          <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: 14 }}>
            ✓ All clear!
          </p>
        )}
      </div>

      {/* settled lends */}
      {settled.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="divider" style={{ flex: 1 }} />
            <p className="section-label">Settled · {settled.length}</p>
            <div className="divider" style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {settled.map((lend, i) => (
              <LendCard key={lend.id} lend={lend} index={i} onSettle={onSettle} isSettled />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

// individual lend card component
function LendCard({ lend, index, onSettle, isSettled = false }: {
  lend: Lend
  index: number
  onSettle: (id: number) => void
  isSettled?: boolean
}) {
  const iLent = lend.direction === 'i-lent'
  const color = iLent ? 'var(--cyan)' : 'var(--red)'
  const rgb = iLent ? '0,255,255' : '255,45,85'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isSettled ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.03 }}
      className="activity-card"
      style={{
        background: isSettled ? 'rgba(255,255,255,0.02)' : `rgba(${rgb},0.03)`,
        border: `1px solid ${isSettled ? 'var(--border)' : `rgba(${rgb},0.1)`}`
      }}
    >
      <div className="activity-bar" style={{ background: isSettled ? 'rgba(255,255,255,0.1)' : color }} />

      <div className="avatar-m" style={{ background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.2)`, color }}>
        {lend.person[0]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 600,
          color: isSettled ? 'var(--muted)' : 'var(--text)',
          textDecoration: isSettled ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {lend.description}
        </p>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: isSettled ? 'var(--muted)' : color, marginTop: 2 }}>
          {iLent ? `You → ${lend.person}` : `${lend.person} → You`} · {lend.date}
        </p>
      </div>

      <p style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700, color: isSettled ? 'var(--muted)' : color }}>
        ₹{lend.amount}
      </p>

      {!isSettled ? (
        <button
          className="settle-btn"
          style={{ background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.2)`, color }}
          onClick={() => onSettle(lend.id)}
        >
          ✓
        </button>
      ) : (
        <div className="settle-btn" style={{ background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', color: 'var(--green)' }}>
          ✓
        </div>
      )}
    </motion.div>
  )
}
