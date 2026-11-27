# Front Desk Hub

A working desktop app for small hotel front desks, built from the Rebuild page of the Front Desk Hub Figma file. ITCT344 Human Computer Interaction term project, MUIC.

It is plain HTML, CSS and JavaScript with no build step, so it runs on GitHub Pages as it is.

## How it works

Every screen reads from one set of hotel data, so an action changes everything it touches. Approve a booking and it shows up in the chat, on the room board and on Today. Fix Room 07 and the alert, the sidebar badge and the Today count all clear. Nothing jumps to a pre-drawn screen.

Your work is saved in the browser, so it is still there after a reload. Most actions show a toast with Undo. To go back to the sample data, open the Go to menu (bottom left corner, or press M) and choose Start over with the sample data.

## What you can do

| Area | Actions |
|---|---|
| Today | See what needs you, worked out live from the inbox, rooms and team. Check guests in (only when their room is ready). Change a room's cleaning status by clicking it. |
| Inbox | Filter by Open, Requests, Drafts and Done, by channel in the sidebar, or search by name. Approve, edit or stop AI drafts, switch them between EN and TH, and choose which offer cards go with them. Type your own reply and press Enter. Send an offer card from the Offer button. Mark a chat done and reopen it. Add notes to call notes and move Khun Somchai's dinner. |
| Booking requests | Four checks run on the live data. Blocking checks stop approval. Approve, suggest another free room that fits, or decline with a reason. Messages can be edited before sending. A suggested room is held on the board until the guest says yes. Add a cleaning task straight from the check. |
| Rooms | Two week board with previous and next week. Overlaps are found automatically and the fix suggests free rooms of the same type, then a free upgrade. Click any booking to see it, check the guest in or move it to another free room. |
| Team | Click any schedule cell to add or change a shift, with checks for training and times. Reassign cleaners by clicking the cleaner, fix problems one by one or all at once, or assign every room by floor. Add, tick and delete tasks. |

The screen is drawn at 1920 by 1080 and scales to fit any 16:9 display, so it looks the same on a laptop, a projector or a full HD monitor.

## Presenting it

Start on Today and work through it like a front desk manager would. A good order is Noor's request, Mia's request, the Room 07 overlap, the three drafts, the desk gap on 19 Nov and the cleaning problems. Every item you finish leaves the Needs you list.

Press M, or hover the bottom left corner, to jump to any page or chat. Press Esc to close a side panel. Start over with the sample data before each run so everyone sees the same starting point.

## Publish on GitHub Pages

1. Create a new public repository on GitHub, for example `ct344-front-desk-hub`.
2. Choose Add file, then Upload files.
3. Open this folder in File Explorer, select everything inside it (`index.html`, `README.md` and the `css`, `js` and `fonts` folders) and drag it into the upload area. Upload the contents, not the outer folder.
4. Check that `index.html` sits at the top level of the repository, then commit.
5. Open Settings, then Pages. Set Source to Deploy from a branch, pick `main` and `/(root)`, then Save.
6. After a few minutes the site is live at `your-username.github.io/ct344-front-desk-hub`

## Run it on your computer

Open the folder in VS Code and start Live Server. Everything works offline because the fonts are stored in the `fonts` folder. Double clicking `index.html` also opens the app, though some browsers then fall back to a system font.

## Files

```
index.html        page shell
css/styles.css    design tokens and all component styles
css/fonts.css     font faces for IBM Plex Sans Thai and IBM Plex Mono
js/icons.js       icon set exported from Figma
js/data.js        sample hotel data (rooms, bookings, chats, staff, tasks)
js/logic.js       rules worked out from the data (overlaps, checks, counts, messages)
js/ui.js          shared parts such as the sidebar, buttons, pills and key tags
js/screens.js     Today, Inbox, Rooms and Team screens
js/main.js        routing, saving, undo, 16:9 scaling and every action
fonts/            IBM Plex fonts (SIL Open Font License)
```

The functionality tests sit in the `Functionality tests` folder next to this one. Run `python run_tests.py ../front-desk-hub-prototype` there to check every flow in Chromium.

Guest names, rooms, prices and dates are sample data written for the project.
