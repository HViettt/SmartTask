# ⚡ Quick Reference: Deadline System

## 🎯 Core Concept

**Deadline = Date + Optional Time in Vietnam Timezone (UTC+7)**

```
Deadline 18th January 2024, 18:30 VN time = HẾT HẠN at 18:30 on 18th

Before 18:30 → status: 'deadline-today' ✓ (on time)
After 18:30  → status: 'overdue' ⚠️ (late)
```

---

## 📚 API Quick Start

### 1. Create Task with Time
```bash
POST /api/tasks
{
  "title": "Submit report",
  "deadline": "2024-01-18T00:00:00.000Z",
  "deadlineTime": "18:30",
  "priority": "High",
  "complexity": "Medium"
}

Response includes: computedStatus: 'safe' | 'deadline-soon' | 'deadline-today' | 'overdue'
```

### 2. Get All Tasks
```bash
GET /api/tasks

Response:
{
  "data": [{
    "title": "Submit report",
    "deadline": "2024-01-18T00:00:00.000Z",
    "deadlineTime": "18:30",
    "status": "Todo",
    "computedStatus": "deadline-today"
  }]
}
```

### 3. Update Task Time
```bash
PUT /api/tasks/:id
{
  "deadlineTime": "20:00"
}
```

---

## 🔧 Backend Helper Functions

### Check if Overdue
```javascript
const { isTaskOverdue } = require('./utils/deadlineHelper');

const task = {
  deadline: new Date('2024-01-18'),
  deadlineTime: '18:30',
  status: 'Todo'
};

if (isTaskOverdue(task)) {
  console.log('Task is late!');
}
```

### Get Display Status
```javascript
const { getDeadlineStatus } = require('./utils/deadlineHelper');

const status = getDeadlineStatus(task);
// Returns: 'safe' | 'deadline-soon' | 'deadline-today' | 'overdue' | 'done'
```

### Format for Display
```javascript
const { formatDeadline } = require('./utils/deadlineHelper');

console.log(formatDeadline(task.deadline, task.deadlineTime));
// Output: "18/01/2024 18:30"
```

---

## 🎨 Frontend Usage

### Display Deadline Status (React)
```jsx
import { useEffect, useState } from 'react';

function TaskCard({ task }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'deadline-today': return 'bg-yellow-100 text-yellow-800';
      case 'deadline-soon': return 'bg-blue-100 text-blue-800';
      case 'safe': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h3>{task.title}</h3>
      <p>Deadline: {task.deadlineTime ? 
        `${task.deadline.slice(0,10)} ${task.deadlineTime}` : 
        task.deadline.slice(0,10)}
      </p>
      <span className={getStatusColor(task.computedStatus)}>
        {task.computedStatus}
      </span>
    </div>
  );
}
```

### Update Deadline Time (React Form)
```jsx
function EditTask({ task, onSave }) {
  const [time, setTime] = useState(task.deadlineTime || '23:59');

  const handleSave = async () => {
    const response = await fetch(`/api/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deadlineTime: time })
    });
    const result = await response.json();
    onSave(result.data);
  };

  return (
    <div>
      <label>Deadline Time</label>
      <input 
        type="time" 
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

---

## 📊 Status Meanings

| Status | Meaning | Color | Action |
|--------|---------|-------|--------|
| `safe` | > 3 days until deadline | 🟢 Green | Keep working |
| `deadline-soon` | 1-3 days until deadline | 🔵 Blue | Speed up |
| `deadline-today` | Deadline is today | 🟡 Yellow | Hurry! |
| `overdue` | Past deadline time | 🔴 Red | Act now! |
| `done` | Task completed | ✅ Gray | Done |

---

## 🚀 Scheduler (Every 30 Minutes)

```
1. Find all unnotified, incomplete tasks
2. Check which ones passed their deadline time (using VN timezone)
3. Create notifications for newly overdue tasks
4. Mark isOverdueNotified = true (don't modify status)
5. Done! Same tasks won't notify twice
```

---

## 🧪 Test Your Code

```bash
# Run deadline helper tests
node scripts/testDeadlineHelper.js

# Should output: ✅ ALL TESTS PASSED!
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T
```javascript
// Using UTC times (wrong timezone)
const overdue = new Date(task.deadline) < new Date();

// Persisting computed values (violates DRY)
task.status = 'Overdue'; // Gets stale!

// Ignoring the time component
if (task.deadline < today) // Only checks date, not time
```

### ✅ DO
```javascript
// Use the helper function (handles timezone)
const overdue = isTaskOverdue(task);

// Compute on demand (always fresh)
const status = getDeadlineStatus(task);

// Include time in calculation
// Helper functions handle date + time automatically
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/utils/deadlineHelper.js` | ⭐ Core logic, all helpers |
| `src/models/Task.js` | Schema with `deadlineTime` field |
| `src/controllers/taskController.js` | API endpoints with validation |
| `src/utils/taskScheduler.js` | 30-min job using helpers |
| `scripts/testDeadlineHelper.js` | Test suite |

---

## 📞 Getting Help

1. **Check test results:** `node scripts/testDeadlineHelper.js`
2. **Read docs:** [PHASE_1_IMPLEMENTATION_COMPLETE.md](PHASE_1_IMPLEMENTATION_COMPLETE.md)
3. **Review code:** JSDoc comments in [src/utils/deadlineHelper.js](src/utils/deadlineHelper.js)
4. **API examples:** In controller comment blocks

---

## 🎓 Remember

- All times are in **Vietnam Timezone (UTC+7)**
- Default deadline time is **23:59** (end of business day)
- Status is **computed**, never persisted as 'Overdue'
- Scheduler runs **every 30 minutes**
- API always returns **`computedStatus`** field

That's it! You now have a production-ready, timezone-safe deadline system! 🚀

