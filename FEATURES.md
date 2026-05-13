# 🎯 Momentum - Complete Features Guide

## Dashboard Features

### 1. Welcome Banner
- Greeting message
- Quick add task button
- Motivational tagline
- Beautiful gradient background

### 2. Top 3 Widget
**What it does:**
- Shows your 3 most important tasks for today
- Auto-sorted by priority (High → Medium → Low)
- Color-coded by priority level
- Shows estimated time per task

**How to use:**
- Focus on these 3 tasks first
- Mark complete with ✓ button
- Delete tasks with 🗑 button
- Completed tasks disappear from view

**Why it matters:**
- Prevents overwhelm from huge task lists
- Forces prioritization
- Keeps focus on what's important

---

### 3. Focus Timer Widget
**What it does:**
- 25-minute Pomodoro timer
- Visual circular progress bar
- Countdown display (mm:ss)
- Session logging

**How to use:**
1. Click "Start Focus"
2. Timer counts down
3. When timer ends, click "Done"
4. Session is logged and streak updates

**Why it matters:**
- Structured focus time
- Prevents task-switching
- Builds accountability
- Creates momentum

**Customization:**
- Edit duration in `src/store/focusStore.ts`
- Default: 25 minutes
- Suggestions: 15, 30, 45 minute options

---

### 4. Focus Streak Widget
**What it does:**
- Shows your current focus streak (days)
- 7-day activity calendar
- Visual indicators of focus days
- Progress toward milestones

**How to use:**
- Keep your streak going
- Aim for consistency
- Small sessions count

**Why it matters:**
- Gamification element
- Builds habits
- Visual motivation
- Celebrates consistency

---

### 5. Quick Stats Widget
**What it does:**
- Shows today's completion rate
- Total focus time tracked
- Number of sessions
- Visual metrics

**Displays:**
- ✓ Tasks Completed Today
- ⏱ Total Focus Time (minutes)
- 🎯 Number of Sessions

**Why it matters:**
- See your progress at a glance
- Motivation to keep going
- Track productivity

---

### 6. Energy & Mood Tracker
**What it does:**
- 1-5 scale energy level selector
- 4 mood options (Happy, Neutral, Stressed, Tired)
- Daily tracking
- Context for productivity

**How to use:**
1. Rate your energy (1 = low, 5 = high)
2. Select your mood from 4 options
3. Data auto-saves
4. Gets personalized suggestions

**Why it matters:**
- ADHD-friendly scheduling
- Understand your patterns
- Schedule tasks by energy
- Track productivity correlations

**Data tracked:**
- Energy level (1-5)
- Mood (4 options)
- Date/time
- Used for insights

---

### 7. Brain Dump Widget
**What it does:**
- Quick capture for random ideas
- Temporary holding area
- Convert to tasks later
- Prevents interruptions

**How to use:**
1. Type a random thought
2. Press Enter or click Add
3. Items appear in list
4. Click arrow to convert to task
5. Click 🗑 to delete

**Why it matters:**
- ADHD solution for intrusive thoughts
- Capture ideas without switching tasks
- Process later when ready
- Reduces distraction

**Workflow:**
```
Random thought → Brain dump → Later convert to task
```

---

## Pages & Views

### Dashboard Home Page
**URL:** `/`

**Features:**
- Welcome banner
- 7 different widgets
- Add task button
- Motivational quote
- Responsive grid layout

**Best for:**
- Morning check-in
- Quick overview
- Starting your day
- Celebrating wins

---

### Today's View
**URL:** `/today`

**Features:**
- Only today's tasks
- Progress bar (% complete)
- Task count
- Quick complete/delete buttons
- Minimal distractions

**What you see:**
- All non-completed tasks scheduled for today
- Completion percentage
- Individual task details
- Quick action buttons

**Best for:**
- Daily focus
- Quick check-in
- Staying on track
- Time blocking

---

### All Tasks View
**URL:** `/tasks`

**Features:**
- Add new task form
- Filter by priority
- Filter by status
- All tasks displayed
- Bulk task management

**Filters:**
- Priority (High/Medium/Low)
- Status (Not Started/In Progress/Completed)
- Date range (optional)

**What you can do:**
- Add detailed tasks
- Set priority
- Add description
- Add tags
- Estimate time
- Mark complete
- Delete
- View history

**Best for:**
- Task creation
- Weekly planning
- Managing entire task list
- Archive view

---

### Insights & Analytics
**URL:** `/insights`

**Analytics Displayed:**
1. **Total Tasks** - All tasks created
2. **Completed** - Number finished
3. **Focus Sessions** - Total sessions logged
4. **Total Focus Time** - Minutes tracked
5. **Completion Rate** - Percentage complete
6. **High Priority Tasks** - Urgent items

**Visual Elements:**
- Color-coded cards
- Large metric displays
- Icons for quick recognition
- Motivational feedback

**Insights Provided:**
- Performance summary
- Personalized encouragement
- Productivity suggestions
- Achievement recognition

**Best for:**
- Weekly review
- Progress tracking
- Pattern recognition
- Motivation boost

---

## Sidebar Navigation

**Quick Links:**
1. 🏠 **Dashboard** - Main hub
2. 📅 **Today** - Today's tasks
3. ✓ **Tasks** - All tasks
4. 📊 **Insights** - Analytics

**Additional Features:**
- Logo/branding
- Collapsible menu
- Current page highlight
- Made for ADHD footer message

---

## Header Controls

**Left:**
- Menu toggle (expand/collapse sidebar)

**Right:**
- Theme toggle (☀️/🌙)
- Dark mode toggle
- Settings access

---

## Task Management

### Adding Tasks

**Method 1: Quick Add**
- From Dashboard banner
- Title only
- Click "Add"
- Defaults to Medium priority

**Method 2: Full Form (Tasks Page)**
- Click "Add Task"
- Title (required)
- Description (optional)
- Priority (default: Medium)
- Estimated time (default: 25 min)
- Tags (optional)
- Click "Add"

**Task Details:**
- Title: What you need to do
- Description: Context/details
- Priority: High/Medium/Low
- Time estimate: Minutes to complete
- Tags: Categories or labels
- Status: Not Started/In Progress/Completed

### Task Status Flow

```
Create Task
    ↓
Not Started (default)
    ↓
In Progress (when working)
    ↓
Completed (when done)
```

### Completing Tasks
- Click ✓ checkmark button
- Task marked complete
- Removed from Today's view
- Stays in history
- Counts toward completion rate

### Deleting Tasks
- Click 🗑 delete button
- Task permanently removed
- Cannot be recovered
- Use with caution

---

## Focus System

### Pomodoro Timer
- **Default:** 25 minutes
- **Customizable:** Edit store
- **Notifications:** Visual cues
- **Tracking:** Automatic logging

### Focus Session Tracking
**Logged data:**
- Date/time started
- Duration
- Task (if linked)
- Completion status
- Sessions count
- Total time

### Streak System
**How it works:**
- 1 session = 1 day streak
- Consecutive days build streak
- Missed day = streak resets
- Shows 7-day history

**Streak Calculator:**
- Counts completed sessions
- Groups by date
- Shows visual calendar
- Large streak number display

---

## Energy & Mood System

### Energy Tracking
**Scale:** 1-5
- 1 = Low energy
- 2 = Below average
- 3 = Normal
- 4 = Good
- 5 = Excellent

### Mood Tracking
**4 Options:**
- 😊 Happy - Positive, energized
- 😐 Neutral - Okay, steady
- 😰 Stressed - Anxious, overwhelmed
- 😴 Tired - Fatigued, low motivation

### Use Cases
**Scheduling by Energy:**
- Hard tasks → High energy times
- Easy tasks → Low energy times
- Creative work → Happy/good energy
- Administrative → Any energy

**Pattern Recognition:**
- Track which tasks work when
- Optimize schedule
- Understand rhythms
- Prevent burnout

---

## Brain Dump Feature

### Quick Capture
**For:**
- Random thoughts
- Brilliant ideas
- Worried thoughts
- Context switches

**Workflow:**
1. Idea pops up
2. Type in Brain Dump (stay focused)
3. Later: Convert to task or delete
4. Task becomes real item on task list

### Why ADHD-Friendly
- Capture interruptions safely
- Don't lose ideas
- Return to current task
- Process in batches

---

## Data & Persistence

### What Gets Saved
✅ Tasks (all details)
✅ Focus sessions
✅ Daily logs (energy/mood)
✅ UI preferences (theme, sidebar)
✅ Brain dump items
✅ User preferences

### Where It's Stored
- Browser's local storage
- Client-side only
- No server/cloud
- Private to your device

### Export/Backup
**To backup:**
1. DevTools (F12)
2. Application tab
3. Local Storage
4. See "momentum-*" entries
5. Copy values
6. Save to file

### Clearing Data
- Clearing cache deletes data
- Browser > Settings > Clear browsing data
- Use with caution!

---

## Customization Options

### Theme
- **Light Mode** - Default
- **Dark Mode** - Easy on eyes
- Toggle: Header sun/moon icon
- Persists: Saved in localStorage

### Colors
**Edit in `tailwind.config.ts`:**
```typescript
primary: '#3B82F6'      // Blue
accent: '#A855F7'       // Purple
success: '#10B981'      // Green
warning: '#F59E0B'      // Amber
```

### Pomodoro Duration
**Edit in `src/store/focusStore.ts`:**
```typescript
duration: 25            // Change to 15, 30, etc.
```

### Sidebar Behavior
- Collapsible/expandable
- Toggle in header
- State persists
- Mobile-optimized collapse

---

## Keyboard Shortcuts (Future)

Coming soon:
- `Ctrl+N` - New task
- `Ctrl+T` - Focus timer
- `Ctrl+D` - Dark mode
- `Escape` - Close modal

---

## Accessibility Features

### Implemented
✅ Keyboard navigation
✅ Color contrast
✅ Focus indicators
✅ Semantic HTML
✅ ARIA labels
✅ Mobile-friendly
✅ Responsive design

### Dark Mode
✅ Full dark theme
✅ Eye-friendly at night
✅ High contrast
✅ Consistent colors

---

## Mobile Experience

### Responsive Breakpoints
- **< 640px** - Mobile (stacked)
- **640-1024px** - Tablet (2-column)
- **> 1024px** - Desktop (3-column)

### Mobile Optimizations
✅ Touch-friendly buttons (48px)
✅ Large fonts for readability
✅ Simplified navigation
✅ Vertical scrolling
✅ Collapsible sidebar

---

## Performance Features

### Optimizations
✅ Local state (no API delay)
✅ Smooth animations
✅ Instant feedback
✅ No page reloads
✅ Responsive UI

### Speed
✅ Fast load time
✅ Instant add task
✅ Quick theme toggle
✅ Smooth transitions

---

## ADHD-Friendly Features

### Anti-Overwhelm
✅ Show only Top 3
✅ Limit task display
✅ Simple interface
✅ Clear hierarchy

### Support
✅ No guilt language
✅ Celebration animations
✅ Encouragement messages
✅ Flexible rescheduling

### Structure
✅ Clear defaults
✅ Guided workflow
✅ Obvious next steps
✅ Visual feedback

### Motivation
✅ Streak counter
✅ Progress tracking
✅ Achievement recognition
✅ Gentle reminders

---

## Future Feature Ideas

### Phase 2
- [ ] Task subtasks
- [ ] Task categories
- [ ] Recurring tasks
- [ ] Due date alerts
- [ ] Calendar view
- [ ] Export to CSV

### Phase 3
- [ ] Cloud sync (Supabase)
- [ ] Team collaboration
- [ ] AI task suggestions
- [ ] Calendar integration
- [ ] Slack notifications
- [ ] Mobile app

### Phase 4
- [ ] Voice input
- [ ] Smart scheduling
- [ ] Habit tracking
- [ ] Advanced analytics
- [ ] Integration marketplace
- [ ] Offline PWA

---

## Tips & Tricks

### Getting the Most Out of Momentum

✅ **Daily Ritual**
1. Morning: Check energy level
2. Review Top 3
3. Start focus session
4. Mark progress
5. Evening: Check insights

✅ **Weekly Review**
1. Check insights page
2. Celebrate completions
3. Plan next week
4. Adjust strategies
5. Reset if needed

✅ **Best Practices**
- Keep Top 3 to 3 tasks
- Use brain dump frequently
- Do one focus session daily
- Check energy realistically
- Review weekly patterns

---

## Support & Troubleshooting

### Common Questions

**Q: How do I delete all tasks?**
A: Delete individually from Tasks page, or clear browser cache

**Q: Where's my data stored?**
A: Browser's local storage (client-side only)

**Q: Can I access data on another device?**
A: Not yet - data is device-specific

**Q: How do I backup my data?**
A: Export from DevTools local storage (see Backup section)

**Q: Can I restore deleted tasks?**
A: No, deletion is permanent

**Q: Why aren't my tasks saving?**
A: Check localStorage is enabled in browser

---

**Enjoy using Momentum! You've got this! 🚀💙**
