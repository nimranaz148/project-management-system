# 🚀 Architecture Updates & New Implementations Explained

This document explains the recent technical additions to the **Project Camp Backend**. It serves as a guide to understand *what* new technologies were introduced, *why* they were necessary, and *how* they work. 

This context is highly useful if you need to explain the system architecture to a project manager, interviewer, client, or if you need to revisit the codebase for future modifications.

---

## 1. WebSockets (using `socket.io`)

### What is it?
Normally, web APIs use a "Request-Response" model (like HTTP). A user clicks a button, sends a request to the server, and the server replies. WebSockets, however, create a **continuous, two-way live connection** between the user's browser and the server.

### Why was it necessary?
In a collaborative Project Management tool, users need to see updates instantly. Without WebSockets, if User A moves a task to "Done", User B would have to manually refresh their page (F5) to see the change.
- **Real-Time Updates:** As soon as a task is created, updated, or deleted, the server immediately pushes this update to everyone viewing that project.
- **Live Notifications:** Users get instant alerts when a task is assigned to them.
- **User Experience:** It makes the app feel like a premium, modern tool (like Jira or Trello) rather than a slow, static website.

### How is it implemented?
- **File:** `src/config/socket.js`
- **Security:** It has an **Authentication Middleware** that checks the user's JWT token. Unauthenticated users cannot connect to the live server.
- **Optimization (Rooms):** Users are grouped into "Rooms" (e.g., a specific project room). When a task is updated in Project X, the server ONLY notifies the users sitting in the "Project X Room", saving bandwidth and processing power.

---

## 2. Redis (using `ioredis`) & Background Jobs

### What is it?
Redis is an **In-Memory Database**. Unlike MongoDB, which saves data on a hard drive, Redis keeps data in RAM. This makes Redis incredibly fast (fetching data in milliseconds). 

### Why was it necessary?
- **Background Jobs (Message Queues):** Using the `bullmq` library with Redis allows us to run heavy tasks in the background. For example, when waiting for OpenAI to generate a complex project summary, the user shouldn't have to stare at a loading spinner. The server accepts the request, puts it in the Redis queue, and the user can keep working. When the AI is done, we notify the user via WebSockets.
- **Performance & Caching:** Heavy database queries (like loading the project dashboard for thousands of users) can slow down MongoDB. We can store this frequent data in Redis for instant loading.

### How is it implemented?
- **File:** `src/config/redis.js`
- Connected directly to our main Node.js server (`index.js`).

---

## 3. Activity Logs (Audit Trail)

### What is it?
A logging system that records every significant action taken by a user (e.g., "User John created Task X at 2:00 PM from IP Address 192.168.1.1").

### Why was it necessary?
- **Security & Accountability:** In enterprise project management, it is critical to know *who* changed a task's status or *who* deleted a project. 
- **Transparency:** Helps project admins keep track of the team's activity and undo mistakes if necessary.

### How is it implemented?
- **Model:** `src/models/activityLog.model.js`
- **Helper:** `src/utils/activity-logger.js`
- The helper function `logActivity` is injected into the controllers (`createTask`, `updateTask`, `deleteProject`, etc.). It generates logs silently in the background without slowing down the API response for the user.

---

## 4. Critical Security & Logic Fixes

During the code review, a few manual logic bugs were fixed. It's important to understand why they were fixed:

1. **Password Change Security Flaw:**
   - *Before:* The code checked the old password but forgot to block the request if it was wrong. Anyone could bypass it.
   - *Fixed:* Added an `if (!isOldPasswordCorrect)` condition to immediately block unauthorized password changes.
2. **Admin Deletion Logic:**
   - *Before:* The code checked `totalMembers === 1` to prevent an admin from being deleted. This meant if there was 1 Admin and 1 Member (total 2), the Admin could delete themselves, leaving the project with 0 admins (an orphan project).
   - *Fixed:* The logic now specifically counts the number of users with the `admin` role before allowing a deletion.

---

## 5. Notifications System (Database + Real-time)

### What is it?
A persistent notification system that tracks alerts for users (like task assignments, mentions, or project invites).

### Why was it necessary?
While WebSockets handle *live* notifications perfectly, if a user is offline (e.g., their laptop is closed), they would completely miss the WebSocket event. By saving notifications to a MongoDB `Notification` collection, users can log in later, see the bell icon with an unread badge, and catch up on what they missed.

### How is it implemented?
- **Model:** `src/models/notification.model.js` tracks the recipient, sender, type, and read status.
- **Controllers & Routes:** `/api/v1/notifications` exposes endpoints to fetch notifications, mark a specific one as read, or mark all as read.
- **Workflow Integration:** When an important action happens (like a task being assigned), the backend will both emit a live socket event AND save a notification document in the database so it is never lost.

---

## 6. Background Jobs (BullMQ) & Monitoring (Winston)

### What is it?
- **BullMQ:** A message queue system built on top of Redis. It allows us to process heavy tasks asynchronously.
- **Winston:** A structured logging library that writes server events and errors to physical files (`logs/combined.log` and `logs/error.log`).

### Why was it necessary?
- **For BullMQ:** If the user triggers an action that takes 10 seconds (like sending 50 emails or waiting for an AI response), the API should not freeze. The API instantly responds "Job started" and BullMQ processes it in the background, notifying the user via WebSockets when done.
- **For Winston:** When the app is live in production, we can't see the terminal. Winston records every crash, error, or important event to a file so we can debug issues post-mortem.

### How is it implemented?
- **Files:** `src/utils/logger.js` (Configures Winston) and `src/services/queue.service.js` (Configures BullMQ queues and workers).
- **Integration:** Initialized automatically in `index.js` when the server starts.

---

## 7. Frontend Cinematic Scroll Architecture (Next.js + GSAP + Lenis)

### What is it?
The frontend landing page uses a modern cinematic scroll technique to make the app feel like a premium, high-quality product. It relies on GSAP (GreenSock Animation Platform) for complex scroll-triggered animations and Lenis for smooth scrolling.

### Why was it necessary?
- Standard scrolling can feel abrupt. Lenis intercepts the native scroll and applies lerp (linear interpolation) to make scrolling buttery smooth.
- GSAP's ScrollTrigger enables parallax, pinned horizontal scrolling, and staggered reveals that are too complex for native CSS.

### How is it implemented?
- **File:** rontend/src/app/page.tsx
- **Fixes Applied:** A common bug when mixing Lenis and GSAP is having two separate equestAnimationFrame loops. This causes micro-stutters. We fixed this by removing the manual RAF loop and delegating Lenis's tick to gsap.ticker.add((time) => lenis.raf(time * 1000)).
- **Performance:** Animations use hardware-accelerated CSS properties (transforms, opacity, and clip-paths), and complex fonts (DM Sans and Syne) are loaded using 
ext/font/google to prevent render-blocking.

---

## 8. Frontend Implementation: Kanban, AI & Projects (Phases 1-3)

### What is it?
The core application interface for the workspace dashboard. This includes the Sidebar layout, Project List, Project Detail view, the Drag-and-Drop Kanban Board, and a floating AI Assistant Panel.

### Why was it necessary?
To provide a tangible interface to all the backend APIs we built. The goal was to build a modern, minimalist "Calm Design" interface without 3D distractions, prioritizing speed and focus.

### How is it implemented?
- **Routing:** Utilizes Next.js App Router (`/dashboard/projects`, `/dashboard/projects/[id]`, `/dashboard/projects/[id]/board`).
- **Drag-and-Drop:** Built using `@hello-pangea/dnd` (a modern fork of `react-beautiful-dnd`) because it's stable and works flawlessly with React 18, avoiding the timeout issues we faced with Shadcn's dnd CLI.
- **AI Chat:** Built as a persistent floating widget (`AIAssistantPanel.tsx`) located in `layout.tsx` so users can chat with AI without losing their context or current page.
- **Data Flow:** Separated business logic into service files (`task.service.ts`, `project.service.ts`) making API calls with `axios` to ensure the UI components remain clean and focused on presentation.

---

## 9. Frontend Implementation: Team & Notifications (Phases 4-5)

### What is it?
The final implementation phases focus on the collaborative aspects of the tool: managing team members and real-time alerts.

### Why was it necessary?
A project management tool isn't functional without a team. We needed UI to invite users, assign tasks to specific people, restrict access based on roles, and alert users instantly.

### How is it implemented?
- **Team Management:** Built the Team page (`/dashboard/team/page.tsx`) to fetch and display members. Admins can invite new users, while standard members can only view the list.
- **Task Assignment & Role-Based Access Control (RBAC):** 
  - Added an "Assignee" selector in the `CreateTaskModal`. 
  - The Kanban board (`board/page.tsx`) was upgraded to visually show who a task is assigned to.
  - Crucially, dragging and dropping is now **restricted**. The frontend checks `userRole === 'admin' || task.assignedTo._id === currentUser._id` to prevent members from dragging tasks that belong to someone else. The backend also strictly enforces this with `403 Forbidden`.
- **Live Notifications & Inbox:**
  - Designed the Inbox page (`/dashboard/notifications`) to list persistent notifications from the backend.
  - Hooked up `Socket.io` in the main `DashboardLayout`. Whenever a real-time event is received, it increments the unread badge in the sidebar and pops up a live Toast alert automatically.
- **Production-Grade Sidebar Refactor:** Redesigned the main dashboard sidebar layout (with categorized navigation and a custom dark header) to match a highly polished, enterprise-grade aesthetic.
