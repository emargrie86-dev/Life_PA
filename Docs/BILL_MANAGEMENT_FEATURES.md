# 📅 Bill Management Features

## ✅ New Features Added

Your receipt scanning now includes powerful **bill management** features:

1. **📅 Due Date** - Track when bills are due
2. **🔄 Recurring Billing** - Mark bills that repeat (monthly, weekly, etc.)
3. **⏰ Auto Reminder Setup** - Automatically create reminders for bills

## 🎯 Perfect For:
- Utility bills (British Gas, Thames Water, etc.)
- Subscription services (Netflix, Spotify, etc.)
- Rent payments
- Insurance premiums
- Credit card bills
- Any recurring expense

## 📸 How to Use

### When Saving a New Receipt:

1. **Upload & Process Receipt**
   - Go to "Scan Receipt"
   - Upload your bill
   - Click "Process Receipt"

2. **On the Preview Screen, you'll see NEW fields:**

   #### **Due Date** (Optional)
   ```
   Due Date (Optional)
   [2025-11-20] ← Enter YYYY-MM-DD format
   Enter date when this bill is due
   ```
   - Type the date your bill is due
   - Format: YYYY-MM-DD (e.g., 2025-11-20)

   #### **Recurring Bill** (Toggle)
   ```
   Recurring Bill        [OFF/ON] ← Toggle switch
   
   When ON, select frequency:
   [Weekly] [Monthly] [Quarterly] [Yearly]
   ```
   - Toggle **ON** if this bill repeats
   - Select frequency: Weekly, Monthly, Quarterly, or Yearly
   - Perfect for utility bills, subscriptions, rent

   #### **Set Up Reminder** (Only appears if Due Date is set)
   ```
   Set Up Reminder      [OFF/ON] ← Toggle switch
   
   When ON:
   Remind me [3] days before due date
   
   💡 Reminder will be created for November 17, 2025
   ```
   - Toggle **ON** to automatically create a reminder
   - Choose how many days before (default: 3 days)
   - Shows preview of when reminder will fire
   - Reminder automatically links to the bill

3. **Click "Save Receipt"**
   - Receipt saved with bill details
   - If reminder enabled, it's automatically created!

## 📋 Example: British Gas Bill

Let's say you scanned a British Gas bill:
- **Amount**: £61.91
- **Due Date**: November 20, 2025
- **Recurring**: Monthly (every month)
- **Reminder**: 3 days before

### What You Enter:
```
┌─────────────────────────────────────┐
│ Merchant Name: British Gas         │
│ Amount: £61.91                      │
│ Currency: GBP                       │
│ Category: Utilities                 │
│                                     │
│ Due Date (Optional)                 │
│ [2025-11-20]                       │
│                                     │
│ Recurring Bill        [ON ●]       │
│ [Monthly✓] [Quarterly] [Yearly]   │
│                                     │
│ Set Up Reminder       [ON ●]       │
│ Remind me [3] days before          │
│ 💡 Reminder: November 17, 2025     │
│                                     │
│ [Cancel]  [Save Receipt]           │
└─────────────────────────────────────┘
```

### What Happens When You Save:
1. ✅ **Receipt saved** with all details
2. ✅ **Due date stored**: November 20, 2025
3. ✅ **Marked as recurring**: Monthly
4. ✅ **Reminder created**: "Payment Due: British Gas"
   - Fires on: November 17, 2025 (3 days before)
   - Message: "Bill payment of £61.91 due"
   - Category: "Bills"
   - Linked to receipt

## 🔄 Recurring Billing Explained

### Frequency Options:

| Frequency | Example Use Case |
|-----------|------------------|
| **Weekly** | Weekly subscriptions, gym membership |
| **Monthly** | Utilities, rent, subscriptions (most common) |
| **Quarterly** | Quarterly insurance, council tax |
| **Yearly** | Annual subscriptions, insurance premiums |

### What "Recurring" Does:
- ✅ Marks the bill as recurring in your records
- ✅ Helps you track regular expenses
- ✅ Reminder will also be marked as recurring
- ✅ Future feature: Auto-generate next month's reminder

## ⏰ Reminder System

### How It Works:

1. **You set a due date**: November 20, 2025
2. **You choose days before**: 3 days
3. **System calculates**: November 17, 2025
4. **Reminder created with:**
   - **Title**: "Payment Due: British Gas"
   - **Description**: "Bill payment of £61.91 due"
   - **Date**: November 17, 2025
   - **Category**: "Bills"
   - **Link**: To the receipt (click reminder → opens bill)

### Days Before Options:
- **1 day** - Last minute reminder
- **3 days** - Recommended (default)
- **7 days** - Week ahead notice
- **14 days** - Two weeks notice (good for large bills)

### Where Reminders Appear:
- ✅ **Home Screen**: "Upcoming Tasks" section
- ✅ **View Tasks**: Under "Reminders" tab
- ✅ **Notifications**: (when push notifications enabled)

## 📱 Viewing & Editing Bill Details

### On Receipt Detail Screen:

```
┌─────────────────────────────────────┐
│ ← Receipt Details                   │
├─────────────────────────────────────┤
│ [Receipt Image]                     │
├─────────────────────────────────────┤
│ Merchant: British Gas               │
│ Date: October 15, 2025              │
│ Amount: £61.91                      │
│ Currency: GBP                       │
│ Category: Utilities                 │
│ Notes: October bill                 │
│                                     │
│ Due Date: November 20, 2025        │  ← NEW!
│ Recurring Bill: Yes                │  ← NEW!
│ Frequency: Monthly                 │  ← NEW!
│                                     │
│ [Edit]  [Delete]                   │
└─────────────────────────────────────┘
```

### Click "Edit" to Modify:
- Change due date
- Toggle recurring on/off
- Change frequency
- All other fields too

## 🎨 UI Elements

### Toggle Switches:
- **OFF**: Gray switch on left
- **ON**: Blue switch on right
- Tap to toggle

### Frequency Chips:
- **Unselected**: Gray outline
- **Selected**: Blue filled
- Tap any chip to select

### Date Input:
- Format: YYYY-MM-DD
- Example: 2025-11-20
- Keyboard: Standard text

### Days Input:
- Format: Number only
- Example: 3, 7, 14
- Keyboard: Number pad

## 📊 Benefits

### Before:
```
❌ Manual reminder creation for every bill
❌ No tracking of recurring expenses
❌ Forgetting bill due dates
❌ No link between receipt and reminder
```

### Now:
```
✅ One-click reminder creation
✅ Track all recurring bills
✅ Never forget a due date
✅ Reminders link to receipts
✅ Perfect for budgeting
```

## 🧪 Testing the New Features

### Test 1: Simple Bill with Reminder

1. **Upload a bill** (any bill)
2. **Set due date**: 2025-12-01
3. **Toggle "Set Up Reminder"**: ON
4. **Days before**: 3
5. **Click "Save Receipt"**
6. **Check "View Tasks"**: You should see reminder for 2025-11-28

### Test 2: Recurring Monthly Bill

1. **Upload utility bill** (British Gas, Thames, etc.)
2. **Set due date**: 2025-11-20
3. **Toggle "Recurring Bill"**: ON
4. **Select**: Monthly
5. **Toggle "Set Up Reminder"**: ON
6. **Click "Save Receipt"**
7. **Check receipt details**: Shows "Recurring: Yes, Monthly"
8. **Check reminder**: Marked as recurring

### Test 3: Edit Existing Receipt

1. **Open any saved receipt**
2. **Click "Edit"**
3. **Add due date**: 2025-12-15
4. **Toggle "Recurring"**: ON
5. **Select**: Quarterly
6. **Click "Save Changes"**
7. **Verify changes saved**

## 💡 Pro Tips

### Tip 1: Batch Process Bills
- Upload all monthly bills at once
- Set them all as recurring monthly
- Enable reminders for all
- One-time setup, ongoing benefit

### Tip 2: Stagger Reminders
- Rent: 7 days before (big expense)
- Utilities: 3 days before (medium)
- Subscriptions: 1 day before (small)

### Tip 3: Use Notes Field
- "Paid via direct debit"
- "Check meter reading"
- "Cancellation needed"

### Tip 4: Categorize Properly
- Utilities: Gas, electric, water
- Transport: Car insurance, fuel
- Healthcare: Prescriptions, insurance
- Helps with analytics later

## 🚀 Future Enhancements (Planned)

- [ ] Auto-detect due dates from OCR text
- [ ] Auto-generate next month's reminder (for recurring bills)
- [ ] Bill comparison (month-over-month)
- [ ] Overdue bill warnings
- [ ] Payment status tracking (paid/unpaid)
- [ ] Direct debit management
- [ ] Bill forecasting for budgeting

## 🎉 Summary

**You can now:**
- ✅ Set due dates for bills
- ✅ Mark bills as recurring (weekly/monthly/quarterly/yearly)
- ✅ Auto-create reminders X days before due date
- ✅ Link reminders to receipts
- ✅ Track all your bills in one place
- ✅ Never miss a payment again!

**Perfect for managing:**
- 🏠 Utilities (gas, electric, water)
- 💳 Credit card bills
- 🏡 Rent/mortgage
- 📱 Subscriptions (Netflix, Spotify, etc.)
- 🚗 Insurance (car, home, health)
- 💰 Any recurring payment

**Test it now with your British Gas bill!** Set due date, mark as recurring monthly, and enable the reminder. You'll see how powerful this system is! 🎯

