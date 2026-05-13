# 🚀 Momentum Setup Guide

## Quick Start (5 minutes)

### 1. Install Node.js

Make sure you have **Node.js 18 or higher** installed:

```bash
node --version  # Should show v18+ or higher
```

If not installed, download from: https://nodejs.org/

### 2. Navigate to Project

```bash
cd momentum
```

### 3. Install Dependencies

```bash
npm install
```

This downloads all required packages (might take 1-2 minutes first time).

### 4. Start Development Server

```bash
npm run dev
```

You'll see:
```
> next dev
ready - started server on 0.0.0.0:3000
```

### 5. Open in Browser

Visit: **http://localhost:3000**

🎉 **That's it! The app is running!**

---

## ✅ Verification

You should see:

- [ ] Welcome banner ("Welcome back! 🚀")
- [ ] Your Top 3 tasks widget
- [ ] Focus timer widget
- [ ] Streak counter
- [ ] Quick stats
- [ ] Left sidebar with menu
- [ ] Header with theme toggle

---

## 📚 First Steps in the App

### 1. Add a Task

1. Click **"Tasks"** in left sidebar
2. Type a task title (e.g., "Buy groceries")
3. Select priority (High/Medium/Low)
4. Click **"Add"**
5. Task appears in your list!

### 2. Try Today's View

1. Click **"Today"** in sidebar
2. See your today's tasks
3. Watch progress bar update
4. Complete a task by clicking the ✓ button

### 3. Start a Focus Session

1. Back to **Dashboard** (home icon)
2. Find "⏱ Focus Timer" widget
3. Click **"Start Focus"**
4. Timer counts down (25 minutes)
5. When done, click **"Done"**
6. Session is logged!

### 4. Check Insights

1. Click **"Insights"** in sidebar
2. See your productivity stats
3. View completion rate
4. Check your focus sessions

### 5. Toggle Dark Mode

1. Click sun/moon icon in top-right
2. App switches to dark mode
3. Setting is saved!

---

## 🛠 Development Commands

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm start       # Run production server
npm run lint    # Check code quality
```

---

## 📁 Where's the Code?

- **Pages**: `src/app/`
- **Components**: `src/components/`
- **State**: `src/store/`
- **Styles**: `tailwind.config.ts`

---

## 💾 Your Data

- Tasks are saved to browser's **local storage**
- Data persists when you close/reopen app
- Clearing browser cache deletes data
- No accounts or login needed

---

## 🎨 Customizing the App

### Change App Title

Edit `src/app/layout.tsx`:
```typescript
title: 'Your App Name'
```

### Change Colors

Edit `tailwind.config.ts`:
```typescript
primary: '#YOUR_HEX_COLOR'
```

### Add a New Page

1. Create folder: `src/app/new-page/`
2. Add file: `page.tsx`
3. It automatically becomes a route!

---

## 🚀 Ready to Deploy?

### Deploy to Vercel (Free, Easiest)

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Select your GitHub repo
5. Click "Deploy"
6. 🎉 Your app is live!

### Environment Setup

Create `.env.local` for secrets:
```
NEXT_PUBLIC_APP_NAME=Momentum
```

---

## 🐛 Troubleshooting

### Port 3000 already in use?

```bash
npm run dev -- -p 3001  # Use port 3001 instead
```

### Tasks not saving?

- DevTools > Application > Local Storage
- Should see "momentum-tasks" entry
- If empty, refresh page
- Check browser settings allow localStorage

### Build fails?

```bash
rm -rf node_modules .next
npm install
npm run build
```

### Still stuck?

1. Check the browser console (F12)
2. Look for red error messages
3. Try restarting dev server
4. Refresh page (Ctrl+Shift+R)

---

## 📚 What to Learn Next

- [ ] Read the README.md for full feature list
- [ ] Explore the code in `src/` folder
- [ ] Try modifying component colors
- [ ] Add a new page following existing patterns
- [ ] Learn about Zustand (state management)
- [ ] Learn about Tailwind CSS (styling)

---

## 💡 Tips for Best Experience

✅ **DO:**
- Add realistic tasks for your day
- Use High priority for important tasks
- Complete focus sessions to build streak
- Check Insights to see patterns
- Use dark mode at night for eye comfort

❌ **DON'T:**
- Add 50+ tasks (stick to Top 3!)
- Rush through focus sessions
- Force yourself on bad days
- Compare your productivity to others
- Use Momentum as a punishment tool

---

## 🎓 Learn the Code

### Key Files to Understand

1. **`src/store/taskStore.ts`** - Where tasks are managed
2. **`src/components/Dashboard.tsx`** - Main dashboard view
3. **`src/app/page.tsx`** - Home page
4. **`tailwind.config.ts`** - Colors and styling

### File Tree
```
momentum/
├── src/
│   ├── app/          # Pages (routes)
│   ├── components/   # React components
│   └── store/        # State management
├── public/           # Images, icons
├── package.json      # Dependencies
└── README.md         # Full docs
```

---

## 🆘 Getting Help

1. **Error in console?** - Read it carefully, it usually tells you what's wrong
2. **Code not working?** - Check if you saved the file (look for white dot on tab)
3. **Page blank?** - Refresh browser (Ctrl+R or Cmd+R)
4. **Still stuck?** - Check README.md troubleshooting section

---

## 🎉 You're All Set!

You now have a fully functional ADHD-friendly productivity app running locally!

### Next Steps:

1. **Add some tasks** and try it out
2. **Run a focus session** and feel the momentum
3. **Check your insights** to see patterns
4. **Customize the design** to make it yours
5. **Deploy to Vercel** to share with others

---

## 💙 Remember

- Small wins count
- Consistency > Perfection
- This tool is here to support you, not judge you
- You're doing better than you think

**Happy productive coding! 🚀**
