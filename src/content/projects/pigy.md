---
title: "pigy — a private Android app"
summary: "An Android app I'm building for scanning documents to PDF, keeping notes, and setting reminders. Everything stays on the phone and is protected by the app lock. The foundation and lock are done; notes are next."
year: 2026
kind: independent
status: in-progress
tags:
  - Android
  - Kotlin
  - Jetpack Compose
  - Privacy
featured: true
order: 2
draft: false
verified: true
---

pigy is a small Android app I'm building for three everyday things: turning paper documents
into PDFs, writing notes, and setting reminders. Everything stays on the phone. There is no
account, no server, and no analytics, and the app is locked with the phone's fingerprint or
screen lock.

## What works now

The app shell and the lock system are finished.

- The app opens into three tabs: Documents, Notes, and Reminders.
- On first launch you set up the app; after that it asks for fingerprint or phone password.
- It locks itself again when you leave it, and the settings screen lets you change the
  timeout.
- The build and automatic checks run on GitHub, and a basic test suite is in place.

I built the lock first because all three features will store data behind it. I still need to
try it on my demo phone before calling this part done.

## What I'm working on next

The next step is the notes feature:

- a list of notes and a simple editor;
- saving while you type;
- search, pin, and delete with undo.

After notes, the plan is:

1. **Document scanner** — scan multiple pages, crop them, save them as an encrypted PDF,
   and keep a small document library.
2. **Reminders** — one-time, daily, and weekly reminders, with complete and snooze actions.
3. **Polish** — dark mode, empty and error screens, and a final pass before the first demo.

pigy is written in Kotlin with Jetpack Compose, and the first version targets Android 11 and
newer. I'll update this page as each part lands. There is no public download yet; the
repository is private while the first version is being built.
