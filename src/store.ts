import { useState } from 'react'

export type AppMode = 'daily' | 'trips'

export type Lend = {
  id: number
  description: string
  amount: number
  person: string
  direction: 'i-lent' | 'they-lent'
  date: string
  settled: boolean
}

export type TripExpense = {
  id: number
  description: string
  amount: number
  paidBy: string
  splitAmong: string[]
  date: string
  settled: boolean
}

export type Trip = {
  id: number
  name: string
  emoji: string
  members: string[]
  expenses: TripExpense[]
}

// some default data for testing
const defaultLends: Lend[] = [
  { id: 1, description: 'Lunch', amount: 120, person: 'Rishi', direction: 'i-lent', date: '2025-07-14', settled: false },
  { id: 2, description: 'Auto fare', amount: 80, person: 'Adil', direction: 'they-lent', date: '2025-07-13', settled: false },
  { id: 3, description: 'Coffee', amount: 60, person: 'Anakha', direction: 'i-lent', date: '2025-07-12', settled: false },
  { id: 4, description: 'Books', amount: 200, person: 'Rishi', direction: 'they-lent', date: '2025-07-10', settled: true },
]

const defaultTrips: Trip[] = [
  {
    id: 1,
    name: 'Goa Trip',
    emoji: '🏖️',
    members: ['Snehal', 'Rishi', 'Adil', 'Anakha'],
    expenses: [
      { id: 1, description: 'Hotel', amount: 3200, paidBy: 'Snehal', splitAmong: ['Snehal', 'Rishi', 'Adil', 'Anakha'], date: '2025-07-10', settled: false },
      { id: 2, description: 'Dinner', amount: 1800, paidBy: 'Rishi', splitAmong: ['Snehal', 'Rishi', 'Adil', 'Anakha'], date: '2025-07-11', settled: false },
      { id: 3, description: 'Cab', amount: 600, paidBy: 'Adil', splitAmong: ['Snehal', 'Rishi', 'Adil'], date: '2025-07-12', settled: false },
    ],
  },
]

export function useAppStore() {
  const [lends, setLends] = useState<Lend[]>(defaultLends)
  const [trips, setTrips] = useState<Trip[]>(defaultTrips)
  const [dailyMembers, setDailyMembers] = useState<string[]>(['Rishi', 'Adil', 'Anakha'])

  // calculate net balance
  let netBalance = 0
  for (const l of lends) {
    if (!l.settled) {
      if (l.direction === 'i-lent') {
        netBalance += l.amount
      } else {
        netBalance -= l.amount
      }
    }
  }

  function addLend(l: Omit<Lend, 'id'>) {
    const newLend = { ...l, id: Date.now() }
    setLends(prev => [newLend, ...prev])
  }

  function settleLend(id: number) {
    setLends(prev => prev.map(l => {
      if (l.id === id) {
        return { ...l, settled: true }
      }
      return l
    }))
  }

  function addDailyMember(name: string) {
    if (!name || dailyMembers.includes(name)) return
    setDailyMembers(prev => [...prev, name])
  }

  function removeDailyMember(name: string) {
    setDailyMembers(prev => prev.filter(m => m !== name))
  }

  function createTrip(name: string, emoji: string, members: string[]) {
    const newTrip: Trip = {
      id: Date.now(),
      name,
      emoji,
      members: ['Snehal', ...members], // always add myself first
      expenses: [],
    }
    setTrips(prev => [newTrip, ...prev])
  }

  function addTripMember(tripId: number, name: string) {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t
      if (t.members.includes(name)) return t // already exists
      return { ...t, members: [...t.members, name] }
    }))
  }

  function removeTripMember(tripId: number, name: string) {
    if (name === 'Snehal') return // can't remove myself
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t
      return { ...t, members: t.members.filter(m => m !== name) }
    }))
  }

  function addTripExpense(tripId: number, expense: Omit<TripExpense, 'id'>) {
    const newExpense = { ...expense, id: Date.now() }
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t
      return { ...t, expenses: [...t.expenses, newExpense] }
    }))
  }

  function settleTripExpense(tripId: number, expenseId: number) {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t
      return {
        ...t,
        expenses: t.expenses.map(e => {
          if (e.id === expenseId) {
            return { ...e, settled: true }
          }
          return e
        })
      }
    }))
  }

  // this calculates who owes who in a trip
  // using greedy algorithm - not perfect but works
  function getSettlements(trip: Trip) {
    const balance: Record<string, number> = {}

    // initialize everyone's balance to 0
    for (const member of trip.members) {
      balance[member] = 0
    }

    // calculate balances
    for (const expense of trip.expenses) {
      const share = expense.amount / expense.splitAmong.length
      
      // subtract share from everyone who needs to pay
      for (const person of expense.splitAmong) {
        balance[person] -= share
      }
      
      // add full amount to person who paid
      balance[expense.paidBy] += expense.amount
    }

    // separate into people who owe money and people who are owed
    const debtors = []
    const creditors = []
    
    for (const [name, bal] of Object.entries(balance)) {
      if (bal < -0.01) {
        debtors.push({ name, bal })
      } else if (bal > 0.01) {
        creditors.push({ name, bal })
      }
    }

    // sort them
    debtors.sort((a, b) => a.bal - b.bal) // most negative first
    creditors.sort((a, b) => b.bal - a.bal) // most positive first

    const result: { from: string; to: string; amount: number }[] = []

    let i = 0
    let j = 0
    
    // match debtors with creditors
    while (i < debtors.length && j < creditors.length) {
      const payment = Math.min(-debtors[i].bal, creditors[j].bal)
      
      result.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: Math.round(payment)
      })

      debtors[i].bal += payment
      creditors[j].bal -= payment

      if (Math.abs(debtors[i].bal) < 0.01) i++
      if (Math.abs(creditors[j].bal) < 0.01) j++
    }

    return result
  }

  return {
    lends,
    trips,
    dailyMembers,
    netBalance,
    addLend,
    settleLend,
    addDailyMember,
    removeDailyMember,
    createTrip,
    addTripMember,
    removeTripMember,
    addTripExpense,
    settleTripExpense,
    getSettlements,
  }
}
