# Naija Fresher 3D (frontend only for now)

Static website. No build step. Everything runs in the browser.

| File | Type | What it does |
|---|---|---|
| index.html | frontend | The page. Loads three.js from the internet, then phone.js, then game.js |
| style.css | frontend | All the look: buttons, HUD, joystick, phone |
| games.css | frontend | Look of the phone games |
| phone.js | frontend | The in-game phone: WhatsApp (bot for now), Contacts, Rides, Games, Comics, Flights, Bank, Maps |
| game.js | frontend | The 3D campus: world, people, vehicles, rides, airport and flights |
| life.js | frontend | Student day: clock, alarm, hostel (ground floor, upstairs, your room), lecture hall, timetable, attendance |
| games.js | frontend | Football, Assignment Rush runner, Ayo, Comics |

Phone apps that work: WhatsApp, Contacts, Rides (pay by Bank), Bank, Maps, Flights (airport), Games (football, runner, Ayo), Comics.

Not connected yet: Supabase (accounts, saved progress, real-player chat). Not built yet: airport, building interiors, exams, timetable driving the day.

## Put it online (Cloudflare Pages, from GitHub)
1. GitHub: create a repo called `naija-fresher`, then Add file > Upload files. Upload the whole folder contents (keep the css and js folders). Commit.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git > pick `naija-fresher`.
3. Framework preset: None. Build command: leave empty. Build output directory: `/` (or leave empty). Save and Deploy.
4. Open the link Cloudflare gives you. Every time you upload a new version to GitHub, it updates by itself.
