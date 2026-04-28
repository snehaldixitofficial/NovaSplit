import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Trip, TripExpense } from '../store'

const colors = ['#00ffff', '#ff2d55', '#bf5af2', '#30d158', '#ff9f0a', '#0a84ff']

type Props = {
  trip: Trip
  onBack: () => void
  onAddExpense: (id: number, e: Omit<TripExpense, 'id'>) => void
  onSettleExpense: (tripId: number, expId: number) => void
  onAddMember: (tripId: number, name: string) => void
  onRemoveMember: (tripId: number, name: string) => void
  settlements: { from: string; to: string; amount: number }[]
}

type Tab = 'expenses' | 'members' | 'settle'

export default function TripDetail({ trip, onBack, onAddExpense, onSettleExpense, onAddMember, onRemoveMember, settlements }: Props) {
  const [tab, setTab] = useState<Tab>('expenses')
  const [showForm, setShowForm] = useState(false)
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(trip.members[0])
  const [splitAmong, setSplitAmong] = useState<string[]>(trip.members)
  const [newMember, setNewMember] = useState('')

  // calculate totals
  let total = 0
  let settledTotal = 0
  for (const e of trip.expenses) {
    total += e.amount
    if (e.settled) settledTotal += e.amount
  }

  const unsettled = trip.expenses.filter(e => !e.settled).reverse()
  const settled = trip.expenses.filter(e => e.settled).reverse()

  function handleAddExpense() {
    if (!desc.trim() || !amount || splitAmong.length === 0) return

    onAddExpense(trip.id, {
      description: desc.trim(),
      amount: parseFloat(amount),
      paidBy,
      splitAmong,
      date: new Date().toISOString().split('T')[0],
      settled: false,
    })

    // reset form
    setDesc('')
    setAmount('')
    setPaidBy(trip.members[0])
    setSplitAmong(trip.members)
    setShowForm(false)
  }

  function toggleSplit(name: string) {
    if (splitAmong.includes(name)) {
      setSplitAmong(splitAmong.filter(m => m !== name))
    } else {
      setSplitAmong([...splitAmong, name])
    }
  }

  function handleAddMember() {
    if (!newMember.trim()) return
    onAddMember(trip.id, newMember.trim())
    setNewMember('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* trip header */}
      <div style={{ padding: '18px 24px 0', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '7px 12px', fontSize: 12, fontFamily: 'var(--mono)' }}
            onClick={onBack}
          >
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{trip.emoji}</span>
              <p style={{ fontSize: 17, fontWeight: 700 }}>{trip.name}</p>
            </div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--purple)', marginTop: 2 }}>
              ₹{total.toLocaleString('en-IN')} total · {trip.members.length} people
              {settledTotal > 0 && (
                <span style={{ color: 'var(--green)', marginLeft: 6 }}>
                  · ₹{settledTotal.toLocaleString('en-IN')} settled
                </span>
              )}
            </p>
          </div>
        </div>

        {/* tabs */}
        <div className="tab-bar">
          <button
            className="tab-btn"
            onClick={() => setTab('expenses')}
            style={{ borderBottom: tab === 'expenses' ? '2px solid var(--purple)' : '2px solid transparent', color: tab === 'expenses' ? 'var(--purple)' : 'var(--muted)', fontWeight: tab === 'expenses' ? 600 : 400 }}
          >
            Expenses
          </button>
          <button
            className="tab-btn"
            onClick={() => setTab('members')}
            style={{ borderBottom: tab === 'members' ? '2px solid var(--purple)' : '2px solid transparent', color: tab === 'members' ? 'var(--purple)' : 'var(--muted)', fontWeight: tab === 'members' ? 600 : 400 }}
          >
            Members ({trip.members.length})
          </button>
          <button
            className="tab-btn"
            onClick={() => setTab('settle')}
            style={{ borderBottom: tab === 'settle' ? '2px solid var(--purple)' : '2px solid transparent', color: tab === 'settle' ? 'var(--purple)' : 'var(--muted)', fontWeight: tab === 'settle' ? 600 : 400 }}
          >
            Settle Up
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px 32px' }}>
        <AnimatePresence mode="wait">

          {/* expenses tab */}
          {tab === 'expenses' && (
            <motion.div key="expenses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
                <button className="btn btn-purple" onClick={() => setShowForm(v => !v)}>
                  {showForm ? 'Cancel' : '+ Add Expense'}
                </button>
              </div>

              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ background: 'rgba(191,90,242,0.04)', border: '1px solid rgba(191,90,242,0.15)', borderRadius: 14, padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What was it for?" />
                    <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount ₹" style={{ fontFamily: 'var(--mono)' }} />

                    <div>
                      <p className="section-label" style={{ marginBottom: 8 }}>PAID BY</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {trip.members.map(m => (
                          <button
                            key={m}
                            onClick={() => setPaidBy(m)}
                            style={{ padding: '5px 12px', borderRadius: 8, background: paidBy === m ? 'rgba(191,90,242,0.15)' : 'rgba(255,255,255,0.04)', border: paidBy === m ? '1px solid rgba(191,90,242,0.4)' : '1px solid var(--border)', color: paidBy === m ? 'var(--purple)' : 'var(--muted)', fontSize: 12, cursor: 'pointer' }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="section-label" style={{ marginBottom: 8 }}>SPLIT AMONG</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {trip.members.map(m => (
                          <button
                            key={m}
                            onClick={() => toggleSplit(m)}
                            style={{ padding: '5px 12px', borderRadius: 8, background: splitAmong.includes(m) ? 'rgba(0,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: splitAmong.includes(m) ? '1px solid rgba(0,255,255,0.25)' : '1px solid var(--border)', color: splitAmong.includes(m) ? 'var(--cyan)' : 'var(--muted)', fontSize: 12, cursor: 'pointer' }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button className="btn btn-purple" style={{ padding: 12 }} onClick={handleAddExpense}>
                      Add Expense
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {unsettled.map((e, i) => (
                  <motion.div
                    key={e.id}
                    className="expense-row"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>{e.description}</p>
                      <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
                        {e.paidBy} paid · split {e.splitAmong.length} ways
                      </p>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--purple)', flexShrink: 0 }}>
                      ₹{e.amount.toLocaleString('en-IN')}
                    </p>
                    <button
                      className="settle-btn"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--muted)' }}
                      onClick={() => onSettleExpense(trip.id, e.id)}
                    >
                      ✓
                    </button>
                  </motion.div>
                ))}

                {settled.length > 0 && (
                  <>
                    <p className="section-label" style={{ marginTop: 8, opacity: 0.5 }}>Settled</p>
                    {settled.map(e => (
                      <div key={e.id} className="expense-row" style={{ opacity: 0.4 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, textDecoration: 'line-through' }}>{e.description}</p>
                          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>
                            {e.paidBy} paid · split {e.splitAmong.length} ways
                          </p>
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted)' }}>
                          ₹{e.amount.toLocaleString('en-IN')}
                        </p>
                        <div className="settle-btn" style={{ background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.2)', color: 'var(--green)' }}>✓</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* members tab */}
          {tab === 'members' && (
            <motion.div key="members" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="input-row" style={{ marginBottom: 20, maxWidth: 480 }}>
                <input
                  className="input"
                  value={newMember}
                  onChange={e => setNewMember(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                  placeholder="Add a member..."
                />
                <button className="btn btn-purple" onClick={handleAddMember}>+ Add</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, maxWidth: 760 }}>
                {trip.members.map((m, i) => {
                  const color = colors[i % colors.length]
                  const isMe = m === 'Snehal'
                  return (
                    <div
                      key={m}
                      className="member-card"
                      style={{ border: isMe ? '1px solid rgba(191,90,242,0.2)' : '1px solid var(--border)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar-l" style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                          {m[0]}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600 }}>{m}</p>
                          {isMe && (
                            <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--purple)', letterSpacing: '0.1em' }}>YOU</p>
                          )}
                        </div>
                      </div>
                      {!isMe && (
                        <button className="remove-btn" onClick={() => onRemoveMember(trip.id, m)}>×</button>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* settle up tab */}
          {tab === 'settle' && (
            <motion.div key="settle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="section-label" style={{ marginBottom: 16 }}>Who pays whom</p>

              {settlements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <p style={{ fontSize: 32, marginBottom: 12 }}>🎉</p>
                  <p style={{ color: 'var(--muted)', fontSize: 15 }}>All settled up!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
                  {settlements.map((s, i) => (
                    <motion.div
                      key={i}
                      className="settle-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>
                          {s.from[0]}
                        </div>
                        <p style={{ fontSize: 14 }}>{s.from}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p className="section-label" style={{ marginBottom: 2 }}>PAYS</p>
                        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--purple)' }}>₹{s.amount}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 14 }}>{s.to}</p>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'var(--cyan)' }}>
                          {s.to[0]}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  )
}
