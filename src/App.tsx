import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from './store'
import type { AppMode, Trip, Lend } from './store'
import ModeSelector from './screens/ModeSelector'
import DailyHome from './screens/DailyHome'
import DailyActivity from './screens/DailyActivity'
import TripsList from './screens/TripsList'
import TripDetail from './screens/TripDetail'
import Logo from './Logo'

type DailyTab = 'home' | 'activity' | 'members'

export default function App() {
  const [mode, setMode] = useState<AppMode | null>(null)
  const [dailyTab, setDailyTab] = useState<DailyTab>('home')
  const [openTrip, setOpenTrip] = useState<Trip | null>(null)

  const store = useAppStore()

  // get the latest version of the open trip from store
  let currentTrip: Trip | null = null
  if (openTrip) {
    currentTrip = store.trips.find(t => t.id === openTrip.id) ?? openTrip
  }

  const settlements = currentTrip ? store.getSettlements(currentTrip) : []
  const showSidebar = mode !== null && !(mode === 'trips' && openTrip !== null)

  function goHome() {
    setMode(null)
    setOpenTrip(null)
  }

  function handleModeSelect(m: AppMode) {
    setMode(m)
    setDailyTab('home')
    setOpenTrip(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-logo">
          <Logo size={30} />
          <div>
            <p className="header-title">NovaSplit</p>
            <p className="header-sub">
              {mode === 'daily' ? 'Daily Lending' : mode === 'trips' ? 'Trips' : 'Split smarter'}
            </p>
          </div>
        </div>

        {mode && (
          <motion.button whileTap={{ scale: 0.94 }} className="home-btn" onClick={goHome}>
            ⌂ Home
          </motion.button>
        )}
      </header>

      <div className="app-body">
        {showSidebar && (
          <motion.aside
            className="sidebar"
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.22 }}
          >
            {mode === 'daily' && (
              <>
                <button
                  className={`nav-btn ${dailyTab === 'home' ? 'active-cyan' : ''}`}
                  onClick={() => setDailyTab('home')}
                >
                  <span>⬡</span> Home
                </button>
                <button
                  className={`nav-btn ${dailyTab === 'activity' ? 'active-cyan' : ''}`}
                  onClick={() => setDailyTab('activity')}
                >
                  <span>⚡</span> Activity
                </button>
                <button
                  className={`nav-btn ${dailyTab === 'members' ? 'active-cyan' : ''}`}
                  onClick={() => setDailyTab('members')}
                >
                  <span>👥</span> Members
                </button>
              </>
            )}

            {mode === 'trips' && (
              <button className="nav-btn active-purple" onClick={() => setOpenTrip(null)}>
                <span>✈️</span> All Trips
              </button>
            )}

            <div className="spacer" />

            <div className="sidebar-user">
              <p className="sidebar-user-label">Logged in as</p>
              <div className="sidebar-user-row">
                <div className="avatar-s">S</div>
                <p style={{ fontSize: 12, color: 'var(--dim)', fontWeight: 500 }}>Snehal</p>
              </div>
            </div>
          </motion.aside>
        )}

        <main className="main">
          <AnimatePresence mode="wait">

            {mode === null && (
              <ModeSelector key="select" onSelect={handleModeSelect} />
            )}

            {mode === 'daily' && dailyTab === 'home' && (
              <DailyHome
                key="daily-home"
                netBalance={store.netBalance}
                lends={store.lends}
                onAdd={store.addLend}
              />
            )}

            {mode === 'daily' && dailyTab === 'activity' && (
              <DailyActivity
                key="daily-activity"
                lends={store.lends}
                onSettle={store.settleLend}
              />
            )}

            {mode === 'daily' && dailyTab === 'members' && (
              <MembersScreen
                key="daily-members"
                members={store.dailyMembers}
                lends={store.lends}
                onAdd={store.addDailyMember}
                onRemove={store.removeDailyMember}
              />
            )}

            {mode === 'trips' && !openTrip && (
              <TripsList
                key="trips-list"
                trips={store.trips}
                onOpen={setOpenTrip}
                onCreate={store.createTrip}
              />
            )}

            {mode === 'trips' && currentTrip && (
              <TripDetail
                key={`trip-${currentTrip.id}`}
                trip={currentTrip}
                onBack={() => setOpenTrip(null)}
                onAddExpense={store.addTripExpense}
                onSettleExpense={store.settleTripExpense}
                onAddMember={store.addTripMember}
                onRemoveMember={store.removeTripMember}
                settlements={settlements}
              />
            )}

          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// members screen - shows all friends and what they owe
function MembersScreen({ members, lends, onAdd, onRemove }: {
  members: string[]
  lends: Lend[]
  onAdd: (n: string) => void
  onRemove: (n: string) => void
}) {
  const [name, setName] = useState('')
  const colors = ['#00ffff', '#ff2d55', '#bf5af2', '#30d158', '#ff9f0a', '#0a84ff']

  function handleAdd() {
    if (!name.trim()) return
    onAdd(name.trim())
    setName('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="screen"
    >
      <p className="section-label" style={{ marginBottom: 18 }}>
        Daily Members · {members.length}
      </p>

      <div className="input-row" style={{ marginBottom: 24, maxWidth: 480 }}>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Add a friend..."
        />
        <button className="btn btn-cyan" onClick={handleAdd}>+ Add</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, maxWidth: 760 }}>
        {members.map((m, i) => {
          const color = colors[i % colors.length]

          // check what this person owes or is owed
          const memberLends = lends.filter(l => l.person === m && !l.settled)
          let owesMe = 0
          let iOweThem = 0
          for (const l of memberLends) {
            if (l.direction === 'i-lent') owesMe += l.amount
            else iOweThem += l.amount
          }

          return (
            <motion.div
              key={m}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 11,
                    background: `${color}18`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 15, color
                  }}>
                    {m[0]}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{m}</p>
                </div>
                <button className="remove-btn" onClick={() => onRemove(m)}>×</button>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {owesMe > 0 && (
                  <div style={{ flex: 1, background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.1)', borderRadius: 8, padding: '6px 8px' }}>
                    <p className="section-label" style={{ color: 'var(--cyan)', marginBottom: 2 }}>Owes you</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)' }}>₹{owesMe}</p>
                  </div>
                )}
                {iOweThem > 0 && (
                  <div style={{ flex: 1, background: 'rgba(255,45,85,0.05)', border: '1px solid rgba(255,45,85,0.1)', borderRadius: 8, padding: '6px 8px' }}>
                    <p className="section-label" style={{ color: 'var(--red)', marginBottom: 2 }}>You owe</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>₹{iOweThem}</p>
                  </div>
                )}
                {owesMe === 0 && iOweThem === 0 && (
                  <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>All clear ✓</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
