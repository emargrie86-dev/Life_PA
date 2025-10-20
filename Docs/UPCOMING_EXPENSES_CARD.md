# 💳 Upcoming Expenses Card - Homepage

## ✅ What's New

Added an **"Upcoming Expenses"** card to the homepage, matching the style of the "Upcoming Events" card!

## 🎯 What It Shows

The card displays bills and receipts that have **due dates** set:
- Merchant name
- Due date (Today, Tomorrow, or full date)
- Amount with currency symbol
- Category badge
- Recurring indicator (🔄 if recurring)

## 📱 Card Layout

```
┌─────────────────────────────────────┐
│ Upcoming Expenses        View All   │
├─────────────────────────────────────┤
│ 💰  British Gas                     │
│     Tomorrow • 🔄 Recurring         │
│     [Utilities]         £61.91      │
├─────────────────────────────────────┤
│ 💰  Thames Water                    │
│     Nov 25, 2025                    │
│     [Utilities]         £28.00      │
├─────────────────────────────────────┤
│ ...                                  │
└─────────────────────────────────────┘
```

## 🎨 Visual Features

### 1. **Icon with Category Color**
- 💰 money icon for all expenses
- Background tinted with category color
- Same style as events card

### 2. **Merchant Name**
- Bold, prominent text
- Shows who you need to pay

### 3. **Due Date**
- "Today" for today
- "Tomorrow" for tomorrow
- "Overdue" for past dates
- Full date otherwise

### 4. **Recurring Indicator**
- Shows "🔄 Recurring" for recurring bills
- Helps identify subscription/regular payments

### 5. **Category Badge**
- Colored badge showing category
- Transport, Utilities, Healthcare, etc.
- Same colors as receipt list

### 6. **Amount**
- Large, bold green text on the right
- Currency symbol + amount
- Easy to scan total due

## 🔧 How It Works

### Requirements:
For a receipt to appear in "Upcoming Expenses", it must have:
1. ✅ **Due date** set when scanning/saving
2. ✅ Not be past (or show as "Overdue")

### Sorting:
- Shows **next 4 upcoming** bills by due date
- Earliest first
- Overdue bills appear at top

### Clicking:
- Tap any expense → Opens receipt detail screen
- "View All" → Opens receipts list

## 📊 How to Get Expenses to Show

### When Uploading a Document:

1. **Upload your bill** (British Gas, Thames Water, etc.)
2. **On the preview screen:**
   - Set **Due Date**: 2025-11-20
   - Toggle **Recurring Bill**: ON
   - Set frequency if needed
3. **Save Receipt**
4. **Go to Home** → See it in "Upcoming Expenses"!

### Example: British Gas Bill

```
On Preview Screen:
┌─────────────────────────────────────┐
│ Merchant: British Gas               │
│ Amount: £61.91                      │
│                                     │
│ Due Date: 2025-11-20    ← Set this!│
│ Recurring Bill: [ON]    ← Toggle!  │
│ Frequency: Monthly                  │
│                                     │
│ [Save Receipt]                      │
└─────────────────────────────────────┘

On Homepage:
┌─────────────────────────────────────┐
│ Upcoming Expenses                   │
│ 💰  British Gas           £61.91    │
│     Nov 20 • 🔄 Recurring           │
└─────────────────────────────────────┘
```

## 🆚 Upcoming Events vs Upcoming Expenses

### Upcoming Events:
- Tasks and reminders
- Shows calendar icon
- Time displayed
- From "View Tasks"

### Upcoming Expenses:
- Bills and receipts with due dates
- Shows money icon 💰
- Amount displayed (instead of time)
- From "My Receipts"

## ✨ Features

### 1. **Automatic Loading**
- Loads when you open the app
- Refreshes when you return to home
- Always up-to-date

### 2. **Smart Filtering**
- Only shows receipts with due dates
- Excludes receipts without due dates
- Sorts by nearest due date

### 3. **Empty State**
- Shows 💳 icon when no expenses
- "No upcoming expenses"
- "Scan a receipt with a due date"

### 4. **Animations**
- Slides in from left
- Fades in smoothly
- Staggered delays (looks polished!)

## 🧪 Testing

### Test 1: Add an Expense

1. **Go to "Upload Document"**
2. **Upload your British Gas bill**
3. **On preview:**
   - Set due date: Tomorrow's date
   - Toggle recurring: ON
   - Frequency: Monthly
4. **Save**
5. **Go to Home**
6. **Check**: Should see British Gas in "Upcoming Expenses"

### Test 2: Multiple Expenses

1. **Add 5 bills with different due dates**
2. **Go to Home**
3. **Check**: Shows 4 nearest due dates
4. **Sorted**: Earliest at top

### Test 3: Click Expense

1. **Tap any expense in the card**
2. **Expected**: Opens receipt detail screen
3. **Can**: View full details, edit, delete

### Test 4: View All

1. **Click "View All" on the card header**
2. **Expected**: Opens "My Receipts" screen
3. **Can**: See all receipts, filter, search

## 💡 Use Cases

### 1. **Bill Reminders**
- See all upcoming utility bills at a glance
- Never miss a payment
- Quick access to bill details

### 2. **Budget Planning**
- See how much is due soon
- Total up upcoming expenses
- Plan cash flow

### 3. **Subscription Management**
- Track recurring subscriptions
- See when renewals are due
- Cancel if needed

### 4. **Payment Prioritization**
- See what's due first
- Pay overdue bills immediately
- Schedule payments

## 🎯 Future Enhancements (Ideas)

- [ ] Total amount due (sum of all upcoming)
- [ ] Filter by overdue/today/this week
- [ ] Mark as paid
- [ ] Link to payment apps
- [ ] Notifications for upcoming bills
- [ ] Budget warnings

## 📝 Summary

**Added to Homepage:**
- ✅ "Upcoming Expenses" card
- ✅ Shows next 4 bills with due dates
- ✅ Merchant, amount, date, category
- ✅ Recurring indicator
- ✅ Click to view details
- ✅ "View All" to receipts list
- ✅ Same style as events card
- ✅ Smooth animations

**How to Use:**
1. Upload receipts with due dates
2. Toggle recurring for regular bills
3. Check homepage for upcoming expenses
4. Never miss a payment! 💪

**Try it now!** Upload a bill, set a due date, and see it appear on your homepage! 🎉

