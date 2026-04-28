# NovaSplit 💸

NovaSplit is a clean, dark-themed expense splitting app built for college students and friend groups. Whether you're tracking who owes you for lunch or splitting a Goa trip with 6 people, NovaSplit keeps it simple and organized.

Live Deployed Link : https://novasplit-finance.vercel.app/

---

## What it does

Most expense apps are either too simple or way too complicated. NovaSplit sits in the middle — it has two modes depending on what you need:

### 💸 Daily Lending
For everyday stuff like splitting an auto fare, covering someone's coffee, or lending money to a friend. You can:
- Add a lend (either you lent or they lent)
- See your net balance at a glance
- Check who owes you and how much
- Mark lends as settled when paid back
- View full activity history

### ✈️ Trips
For group trips or events where multiple people are paying for different things. You can:
- Create a trip with a name and emoji
- Add members to the trip
- Log expenses with who paid and who it's split among
- See a full breakdown of all expenses
- Use the **Settle Up** tab to see exactly who needs to pay whom and how much — no manual math needed

---

## How the settlement works

The settle up feature uses a greedy algorithm to minimize the number of transactions. So instead of everyone paying everyone, it figures out the most efficient way to settle all debts. For example if 4 people went on a trip and paid different amounts, it'll tell you the minimum payments needed to balance everything out.

---

## Tech Stack

| Tool | Why |
|------|-----|
| React 18 | UI components |
| TypeScript | Type safety |
| Vite | Fast dev server and build |
| Framer Motion | Page and card animations |

No backend, no database — everything runs in memory. Refresh = reset (for now).

---

## Getting Started

```bash
# clone the repo
git clone https://github.com/snehaldixitofficial/NovaSplit.git

# install dependencies
cd NovaSplit
npm install

# run locally
npm run dev
```

---

## Project Structure

```
src/
├── screens/
│   ├── ModeSelector.tsx   # landing screen to pick a mode
│   ├── DailyHome.tsx      # daily lending dashboard
│   ├── DailyActivity.tsx  # full activity list
│   ├── TripsList.tsx      # all trips
│   └── TripDetail.tsx     # single trip view with expenses + settle up
├── store.ts               # all state and logic
├── App.tsx                # main layout + routing
├── Logo.tsx               # svg logo
└── index.css              # global styles
```

---


Made by Snehal Dixit
