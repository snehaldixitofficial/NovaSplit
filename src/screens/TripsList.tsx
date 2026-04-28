import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Trip } from '../store'

const emojiList = ['🏖️', '🏔️', '✈️', '🎉', '🚗', '🏕️', '🎓', '🍕', '🌍']

type Props = {
  trips: Trip[]
  onOpen: (t: Trip) => void
  onCreate: (name: string, emoji: string, members: string[]) => void
}

export default function TripsList({ trips, onOpen, onCreate }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('✈️')
  const [members, setMembers] = useState('')

  function handleCreate() {
    if (!name.trim()) return

    // split members by comma
    const memberList = members.split(',').map(m => m.trim()).filter(m => m.length > 0)
    onCreate(name.trim(), emoji, memberList)

    // reset
    setName('')
    setMembers('')
    setEmoji('✈️')
    setShowForm(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="screen"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p className="section-label">Your Trips</p>
        <button className="btn btn-purple" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ New Trip'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{ background: 'rgba(191,90,242,0.04)', border: '1px solid rgba(191,90,242,0.15)', borderRadius: 14, padding: 18, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}
          >
            <p className="section-label" style={{ color: 'var(--purple)' }}>New Trip</p>

            {/* emoji picker */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {emojiList.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    width: 38, height: 38, borderRadius: 9, fontSize: 18,
                    background: emoji === e ? 'rgba(191,90,242,0.15)' : 'rgba(255,255,255,0.04)',
                    border: emoji === e ? '1px solid rgba(191,90,242,0.4)' : '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  {e}
                </button>
              ))}
            </div>

            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Trip name"
            />
            <input
              className="input"
              value={members}
              onChange={e => setMembers(e.target.value)}
              placeholder="Members — Rishi, Adil, Anakha"
            />
            <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>
              Separate names with commas. You are added automatically.
            </p>

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-purple" style={{ flex: 2 }} onClick={handleCreate}>Create Trip</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {trips.map((trip, i) => {
          // calculate total spent
          let total = 0
          for (const e of trip.expenses) {
            total += e.amount
          }

          return (
            <motion.div
              key={trip.id}
              className="trip-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpen(trip)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 26 }}>{trip.emoji}</span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600 }}>{trip.name}</p>
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {trip.members.length} people · {trip.expenses.length} expenses
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--purple)' }}>
                  ₹{total.toLocaleString('en-IN')}
                </p>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>total</p>
              </div>
            </motion.div>
          )
        })}

        {trips.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 13 }}>
            No trips yet. Create one!
          </p>
        )}
      </div>
    </motion.div>
  )
}
