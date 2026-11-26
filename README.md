# Front Desk Hub

Desktop prototype for small hotel front desks, built from the Rebuild page of the Front Desk Hub Figma file. ITCT344 Human Computer Interaction term project, MUIC.

The site is plain HTML, CSS and JavaScript with no build step, so it runs on GitHub Pages as it is.

## What is inside

All 25 desktop frames from Figma are here as screens, and the buttons follow the same prototype links as in Figma. Seven extra screens fill the buttons that had no link in Figma, so every main action in the prototype now leads somewhere.

| Area | Screens |
|---|---|
| Today | Daily overview with the Needs you list, housekeeping and arrivals |
| Inbox | Alex Morgan draft reply (writing, ready, editing, sent), Kenji Sato draft (ready, editing, sent), Khun Pim draft in Thai and English (ready, editing) then offers sent, Mia Laurent booking request (review, suggest a room, suggestion sent, decline, decline sent), Noor Haddad request (all clear, approved, suggest a room, suggestion sent, decline, decline sent) |
| Rooms | Room board, Room 07 booked twice, overlap fixed |
| Team | Schedule, add shift on 19 Nov, shift added, rooms by floor, rooms by floor fixed, tasks |

The screen is drawn at 1920 by 1080 and scales to fit any 16:9 display, so it looks the same on a laptop, a projector or a full HD monitor.

## Presenting it

Start on the Today screen and click through like a front desk manager would. A few extra controls help during a demo.

- The right and left arrow keys step through every screen in order.
- Press M, or hover the bottom left corner, to open a list of all screens and jump to any of them.
- The search box in the inbox filters chats by guest name.
- Room and person options, reason chips, offer chips and task checkboxes can be clicked.

## Publish on GitHub Pages

1. Create a new public repository on GitHub, for example `ct344-front-desk-hub`.
2. Choose Add file, then Upload files.
3. Open this folder in File Explorer, select everything inside it (`index.html`, `README.md` and the `css`, `js` and `fonts` folders) and drag it into the upload area. Upload the contents, not the outer folder.
4. Check that `index.html` sits at the top level of the repository, then commit.
5. Open Settings, then Pages. Set Source to Deploy from a branch, pick `main` and `/(root)`, then Save.
6. After a few minutes the site is live at `your-username.github.io/ct344-front-desk-hub`

## Run it on your computer

Open the folder in VS Code and start Live Server. Everything works offline because the fonts are stored in the `fonts` folder. Double clicking `index.html` also opens the prototype, though some browsers then fall back to a system font.

## Files

```
index.html        page shell
css/styles.css    design tokens and all component styles
css/fonts.css     font faces for IBM Plex Sans Thai and IBM Plex Mono
js/icons.js       icon set exported from Figma
js/ui.js          shared parts such as the sidebar, buttons, pills and key tags
js/screens.js     every screen and the list of routes
js/main.js        routing, 16:9 scaling and small interactions
fonts/            IBM Plex fonts (SIL Open Font License)
```

Guest names, rooms, prices and dates are sample data written for the prototype.
