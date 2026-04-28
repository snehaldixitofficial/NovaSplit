import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Lend } from '../store'

type Props = {
  netBalance: number
  lends: Lend[]
  onAdd: (l: Omit<Lend, 'id'>) => void
}

export default function DailyHome({ netBalance, lends, onAdd }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [person, setPerson] = useState('')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [direction, setDirection] = useState<'i-lent' | 'they-lent'>('i-lent')

  const unsettled = lends.filter(l => !l.settled)

  // calculate totals
  let owedToMe = 0
  let iOwe = 0
  for (const l of unsettled) {
    if (l.direction === 'i-lent') owedToMe += l.amount
    else iOwe += l.amount
  }

  // group amounts by person
  const whoOwesMe: Record<string, number> = {}
  const whoIOwe: Record<string, number> = {}
  for (const l of unsettled) {
    if (l.direction === 'i-lent') {
      whoOwesMe[l.person] = (whoOwesMe[l.person] || 0) + l.amount
    } else {
      whoIOwe[l.person] = (whoIOwe[l.person] || 0) + l.amount
    }
  }

  const isPositive = netBalance >= 0
  const balColor = isPositive ? 'var(--cyan)' : 'var(--red)'

  function handleSave() {
    if (!person.trim() || !desc.trim() || !amount) return

    onAdd({
      person: person.trim(),
      description: desc.trim(),
      amount: parseFloat(amount),
      direction,
      date: new Date().toISOString().split('T')[0],
      settled: false,
    })

    // reset form
    setPerson('')
    setDesc('')
    setAmount('')
    setDirection('i-lent')
    setShowForm(false)
  }

  return (
    <div className="screen">
      <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* balance stats */}
        <div className="stats-row">
          <div className="card-sm">
            <p className="stat-label">Net Balance</p>
            <p className="stat-value" style={{ color: balColor }}>
              ₹{Math.abs(netBalance).toLocaleString('en-IN')}
            </p>
            <p className="stat-sub" style={{ color: balColor }}>
              {isPositive ? '↑ owed to you' : '↓ you owe'}
            </p>
          </div>
          <div className="card-sm">
            <p className="stat-label">Owed to you</p>
            <p className="stat-value" style={{ color: 'var(--cyan)' }}>
              ₹{owedToMe.toLocaleString('en-IN')}
            </p>
            <p className="stat-sub" style={{ color: 'var(--cyan)' }}>
              {Object.keys(whoOwesMe).length} people
            </p>
          </div>
          <div className="card-sm">
            <p className="stat-label">You owe</p>
            <p className="stat-value" style={{ color: 'var(--red)' }}>
              ₹{iOwe.toLocaleString('en-IN')}
            </p>
            <p className="stat-sub" style={{ color: 'var(--red)' }}>
              {Object.keys(whoIOwe).length} people
            </p>
          </div>
        </div>

        {/* breakdown by person */}
        {(Object.keys(whoOwesMe).length > 0 || Object.keys(whoIOwe).length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {Object.keys(whoOwesMe).length > 0 && (
              <div className="card-sm">
                <p className="section-label" style={{ color: 'var(--cyan)', marginBottom: 8 }}>Owed to you</p>
                {Object.entries(whoOwesMe).sort((a, b) => b[1] - a[1]).map(([name, amt]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--cyan)' }}>
                        {name[0]}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--dim)' }}>{name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--cyan)' }}>₹{amt}</span>
                  </div>
                ))}
              </div>
            )}
            {Object.keys(whoIOwe).length > 0 && (
              <div className="card-sm">
                <p className="section-label" style={{ color: 'var(--red)', marginBottom: 8 }}>You owe</p>
                {Object.entries(whoIOwe).sort((a, b) => b[1] - a[1]).map(([name, amt]) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--red)' }}>
                        {name[0]}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--dim)' }}>{name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>₹{amt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* recent lends */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
            <p className="section-label">Recent</p>
            <button
              className={`btn ${showForm ? 'btn-cyan' : 'btn-ghost'}`}
              style={{ padding: '4px 10px', fontSize: 11 }}
              onClick={() => setShowForm(v => !v)}
            >
              {showForm ? '✕ Cancel' : '+ Add'}
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className={`dir-btn ${direction === 'i-lent' ? 'dir-btn-cyan' : 'dir-btn-off'}`}
                      onClick={() => setDirection('i-lent')}
                    >
                      ↑ I lent
                    </button>
                    <button
                      className={`dir-btn ${direction === 'they-lent' ? 'dir-btn-red' : 'dir-btn-off'}`}
                      onClick={() => setDirection('they-lent')}
                    >
                      ↓ They lent
                    </button>
                  </div>
                  <div className="input-row">
                    <input className="input" value={person} onChange={e => setPerson(e.target.value)} placeholder="Person" style={{ flex: 1 }} />
                    <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What for?" style={{ flex: 2 }} />
                    <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹" style={{ flex: 1, fontFamily: 'var(--mono)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-save" onClick={handleSave}>Save</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {lends.slice(0, 5).map(lend => {
            const color = lend.direction === 'i-lent' ? 'var(--cyan)' : 'var(--red)'
            return (
              <div key={lend.id} className="lend-row" style={{ opacity: lend.settled ? 0.4 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div className="lend-dot" style={{ background: lend.settled ? 'var(--green)' : color }} />
                  <div style={{ minWidth: 0 }}>
                    <p className="lend-desc" style={{ color: 'var(--text)', textDecoration: lend.settled ? 'line-through' : 'none' }}>
                      {lend.description}
                    </p>
                    <p className="lend-meta">
                      {lend.direction === 'i-lent' ? `→ ${lend.person}` : `← ${lend.person}`} · {lend.date}
                    </p>
                  </div>
                </div>
                <span className="lend-amount" style={{ color: lend.settled ? 'var(--muted)' : color }}>
                  ₹{lend.amount}
                </span>
              </div>
            )
          })}

          {lends.length === 0 && (
            <p style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              No lends yet
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
