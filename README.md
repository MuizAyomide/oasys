OASYS FIVE WORDS CHALLENGE
Welcome to OASYS FIVE WORDS CHALLENGE
Five words. Three mini-games. One daily adventure.

A colorful, animated vocabulary-learning website where learners discover five new words each day, explore their meanings, and complete three mini-games worth 15 points total. A calendar helps learners see the days they have completed and the days still ahead.
1. Project at a glance
Item	Decision
Project name	OASYS FIVE WORDS CHALLENGE
Frontend	Vite + React + JavaScript
Styling	Tailwind CSS
Icons	lucide-react
Backend	Firebase Authentication + Cloud Firestore
Optional backend extensions	Cloud Functions, Firebase Hosting, App Check
Audience	Young learners; touch-friendly, accessible and playful
Daily content	5 words, meanings, examples and clues
Games	Match the Meaning, Fill the Gap, Spell It
Scoring	1 point per correct answer × 5 questions × 3 games = 15 points/day
Primary navigation	Welcome → Calendar → Today's Words → Explore or Play → Three Games → Results


Design principle: cheerful, readable and animated without sacrificing performance, accessibility or focus. Use simple language, short instructions, large touch targets, and encouraging feedback.
2. Core user journey
WELCOME / LANDING PAGE
    │  "Let's Begin"
    ▼
DAILY CALENDAR
    │  Completed / available / upcoming days
    │  "Play Today's Challenge"
    ▼
TODAY'S FIVE WORDS
    │  Animated word cards, meanings, examples
    ├───────────────┐
    ▼               ▼
EXPLORE WORDS     START CHALLENGE
    │               │
    └───────────────┘
                    ▼
             GAME 1: MATCH THE MEANING
                   5 questions · /5
                    ▼
             GAME 2: FILL THE GAP
                   5 questions · /5
                    ▼
             GAME 3: SPELL IT
                   5 questions · /5
                    ▼
             RESULTS / REWARDS
               Total score · /15
                    │
                    ▼
                CALENDAR
          Mark day completed; return tomorrow
Page 1 — Welcome (/)
- Main headline: Welcome to OASYS FIVE WORDS CHALLENGE.
- Friendly subtitle: Five words a day. Big discoveries along the way!
- Animated floating letters/word bubbles, subtle stars, clouds or shapes.
- Prominent Let's Begin button.
- Optional How It Works section: Discover 5 words → Play 3 games → Earn up to 15 points.
- Keep the primary CTA clear even while decorative animations run.
Page 2 — Challenge Calendar (/calendar)
- Calendar opens immediately after the learner selects Let's Begin.
- Month navigation and an easy way to return to the current day.
- Date states:
  - Completed: challenge submitted; show score when opened.
  - Today / Available: playable daily challenge.
  - Missed: past day without a completed challenge; display separately from upcoming days.
  - Upcoming: future date; locked until its day begins.
  - Unavailable: no published word set; never promise a playable challenge.
- Show progress such as Days completed, Current streak (optional) and Total points earned.
- Initial MVP rule: Only today's challenge is playable. Past dates are view-only; backlog play can be enabled later via a setting.
- Use clear text and icons as well as colors so states remain understandable to everyone.
Page 3 — Today's Words (/today)
- Title: Your Five Words for Today.
- Five animated, tappable vocabulary cards, each with:
  - word, short meaning, example sentence, optional clue or pronunciation text;
  - a front/back reveal animation for exploration;
  - optional audio pronunciation in a future phase.
- Two actions:
  - Explore the Words → /explore, where learners browse, flip and practice without points.
  - Start Challenge → /challenge/match, which starts the three-game sequence.
- Both actions use the same five assigned words for that day; refreshing the page must not change them.
Page 4 — Explore Words (/explore)
- One focused word at a time, with next/previous controls and a 1 of 5 counter.
- Card flip or swipe transition for meaning and example.
- A clear Start Challenge CTA after exploration (exploration is optional).
Page 5 — Mini-games (/challenge/:game)
All three mini-games reuse the day's five words, but present each word in a different way.

Game 1 — Match the Meaning (/challenge/match)
- Show one target word and 3–4 meaning choices, including the correct answer.
- Each word appears once: 5 questions × 1 point = /5.
- Shuffle choices in a stable order for the attempt; prevent accidental double submission.
Game 2 — Fill the Gap (/challenge/fill)
- Show an example sentence with its target word removed.
- Ask the learner to pick the missing word from a small set of options.
- Use all five target words once: 5 questions × 1 point = /5.
- Store a specially authored gapSentence for each word; never assume replacing a word in arbitrary text will create a good question.
Game 3 — Spell It (/challenge/spell)
- Give the learner a clue (meaning or example sentence) and ask them to type or assemble the word.
- Use all five words once: 5 questions × 1 point = /5.
- Normalize harmless input differences (leading/trailing spaces, casing and Unicode normalization); do not silently accept unrelated misspellings.
Game interaction rules
- Large buttons, progress bar, gentle feedback, encouraging messages and reduced-motion support.
- Show one question at a time; advance after the answer is recorded.
- Award 1 only for a correct first submitted answer and 0 otherwise.
- Retry-for-practice can be offered after a wrong answer, but does not add points.
- Questions are not skipped silently; define how a deliberate Skip counts (0 points).
- At the end of each game, show the subscore and a Next Game button.
Page 6 — Results (/results/:date)
- Show Match /5, Fill /5, Spell /5 and a bold Total /15.
- Celebrate completion with a lightweight confetti or star animation.
- Mark the day's calendar entry completed when the final attempt is saved.
- Provide Review Today's Words, Back to Calendar, and optionally Practice Again.
- Practice again cannot overwrite or inflate the official daily score. MVP default: one scored attempt per date; subsequent repeats are unscored.
3. Scoring and progress rules
Mini-game	Questions	Points per correct answer	Maximum
Match the Meaning	5	1	5
Fill the Gap	5	1	5
Spell It	5	1	5
Daily total	15		15


const gameScore = (answers) =>
  answers.reduce((total, answer) => total + (answer.isCorrect ? 1 : 0), 0);

const dailyTotal = matchScore + fillScore + spellScore; // 0–15
- Save answer records and each mini-game's score, not only the final total.
- Prevent more than five scored questions per mini-game.
- A completed challenge remains completed even if the score is below 15.
- Show 15/15 as a perfect score, not a requirement for completion.
- Calculate streaks from completed calendar dates, not points earned.
- An interrupted attempt may be resumed using saved progress; an unfinished attempt does not count as completed.
4. Vocabulary content system (add your words later)
Do not hardcode the daily word list in components. Firestore will hold the content, and a small content service will fetch an assigned set by calendar date. The site must show a graceful Words are being prepared state if a date has no published content.
Word document
Firestore path: words/{wordId}
{
  "word": "brave",
  "meaning": "Ready to face something difficult even when you feel afraid.",
  "exampleSentence": "Mia was brave when she tried something new.",
  "gapSentence": "Mia was ____ when she tried something new.",
  "clue": "Showing courage even when you feel afraid.",
  "difficulty": "beginner",
  "ageBand": "7-10",
  "status": "published",
  "createdAt": "Firestore Timestamp",
  "updatedAt": "Firestore Timestamp"
}
This is example data only. Replace it with your own curated vocabulary. Each word must have a meaningful, child-friendly definition, an unambiguous gap sentence and an appropriate clue. You can add many more documents later without changing the game's components.
Daily word set
Firestore path: dailyChallenges/{YYYY-MM-DD}
{
  "date": "2026-11-07",
  "wordIds": ["brave", "curious", "gentle", "discover", "sparkle"],
  "status": "published",
  "version": 1,
  "publishedAt": "Firestore Timestamp"
}
Important: IDs above illustrate the structure; they are not a complete published lesson. A valid daily challenge must reference exactly five distinct, existing, published words. Generate question choices from the same day's curated word list or from vetted distractors.
Daily assignment strategy
Recommended MVP: editorial scheduling. Create and publish one dailyChallenges/{date} document for each date, referencing five approved words. This is predictable, easy to review and avoids accidental repeats or unsuitable content. The learner's Firestore query is based on the calendar date; it does not randomly select five words on every visit.

Later automation: use a scheduled Cloud Function to assign five approved words to future dates, track recent usage, avoid repeats, validate content and publish only complete sets. Never have every browser independently generate the word assignment.
Adding vocabulary
1. Add or edit approved words in words via a restricted admin interface or a one-time seed script.
2. Validate the word, meaning, clue, example and gap sentence.
3. Create a daily challenge document containing exactly five word IDs.
4. Set its status to published once the day's content passes review.
5. Confirm all three mini-games work for those five words before publishing.
Use Firebase Emulator Suite during development. Keep admin/seed credentials and service account keys out of the client code and Git.
5. Firebase architecture
Services
- Firebase Authentication: start with anonymous sign-in to give each device/session a private user ID; optionally add account linking later to preserve progress across devices. Anonymous accounts may be lost if the user clears site data or changes devices without linking an account.
- Cloud Firestore: word catalog, scheduled daily challenges, in-progress attempts and completed results.
- Cloud Functions (recommended before public launch): validate final submissions and calculate trusted scores server-side. Client-side score display is useful for UX but is not tamper-proof.
- Firebase Hosting: deploy the Vite production build.
- Firebase App Check (recommended): help reduce abuse; it is not a substitute for Firestore rules and server-side validation.
Suggested collections
words/{wordId}
  word, meaning, exampleSentence, gapSentence, clue,
  difficulty, ageBand, status, createdAt, updatedAt

dailyChallenges/{dateKey}
  date, wordIds[5], status, version, publishedAt

users/{uid}
  displayName (optional), createdAt, preferences

users/{uid}/dailyProgress/{dateKey}
  date, challengeVersion, state (in_progress | completed),
  currentGame, currentQuestion, answers, matchScore,
  fillScore, spellScore, totalScore, startedAt, completedAt
Date key convention: YYYY-MM-DD, calculated in a single configured challenge timezone (set in one configuration file). Pick the timezone before launch and keep it consistent for calendar states, daily rollover, and server validation; do not blindly use each user's local timezone. Future and unpublished dates must not be playable.

Security considerations:
- Public learners may read published words and daily challenges but may not write or publish them.
- Learners may read only their own profile and progress; authenticate and enforce request.auth.uid == uid in Firestore Security Rules.
- Never allow learners to directly write an arbitrary official totalScore or modify a completed result. Prefer Cloud Functions or an equivalent trusted endpoint to score and finalize attempts.
- Restrict word editing and challenge publishing to admin users through verified claims and rules or server-only scripts.
- Validate submitted answers, attempt limits, challenge dates and document sizes server-side.
- If children will use the website, minimize personal data, avoid unnecessary analytics/advertising, and review applicable child-privacy obligations before launch.
MVP caveat: if words and correct meanings are sent to the client, a determined user can inspect them. Preventing inflated leaderboards or rewards requires server-validated scoring and a deliberate answer-delivery design; do not treat Firebase client code as secret.
6. Suggested React application structure
oasys-five-words/
├── public/
│   └── assets/                  # Approved static illustrations, sounds, etc.
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── router.jsx
│   │   └── providers.jsx
│   ├── components/
│   │   ├── layout/               # Header, PageShell, Footer
│   │   ├── ui/                   # Button, Card, Modal, ProgressBar
│   │   ├── calendar/             # ChallengeCalendar, DayCell, Legend
│   │   ├── words/                # WordCard, WordFlip, WordCarousel
│   │   ├── games/                # QuestionCard, ChoiceButton, SpellInput
│   │   └── animation/            # FloatingLetters, Reveal, Confetti
│   ├── pages/
│   │   ├── WelcomePage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── TodayPage.jsx
│   │   ├── ExplorePage.jsx
│   │   ├── MatchGamePage.jsx
│   │   ├── FillGapGamePage.jsx
│   │   ├── SpellGamePage.jsx
│   │   ├── ResultsPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── features/
│   │   ├── auth/                 # Anonymous login and user state
│   │   ├── challenges/           # Fetch, build and validate game data
│   │   ├── progress/             # Scores, saves, resume and streaks
│   │   └── vocabulary/           # Word retrieval and display helpers
│   ├── hooks/                    # useDailyChallenge, useProgress, etc.
│   ├── services/
│   │   ├── firebase.js
│   │   ├── wordService.js
│   │   ├── challengeService.js
│   │   └── progressService.js
│   ├── utils/
│   │   ├── dates.js
│   │   ├── scoring.js
│   │   ├── spelling.js
│   │   └── shuffle.js
│   ├── config/
│   │   └── challenge.js         # Timezone and scoring constants
│   ├── styles/
│   │   └── index.css
│   └── main.jsx
├── functions/                    # Optional Cloud Functions for scoring
├── scripts/                      # Admin-only data validation / seeding
├── .env.example
├── .gitignore
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── index.html
├── package.json
├── vite.config.js
└── README.md
This structure is a target architecture, not a claim that these files already exist. Implement modules incrementally; don't generate unused components just to fill folders.
Suggested route map
Route	Screen	Notes
/	Welcome	Entry page
/calendar	Calendar	Daily status and progress
/today	Today's five words	Requires published date assignment
/explore	Explore words	Optional learning mode
/challenge/match	Match the Meaning	Game 1
/challenge/fill	Fill the Gap	Game 2
/challenge/spell	Spell It	Game 3
/results/:date	Results	View saved completed day
*	Not found	Friendly way back to welcome/calendar


Protect challenge navigation: if someone enters a game URL directly, load their date's assigned words and resume or redirect appropriately. Do not trust route order alone as proof the previous mini-game was completed.
7. Visual design and animation
Creative direction
A joyful storybook-meets-learning-game interface: rounded cards, friendly typography, soft gradients, generous whitespace, colorful letters and a light sense of discovery. Maintain contrast and readability; playful should not mean cluttered.

Suggested design tokens (adjustable):
Token	Starting idea
Background	Warm cream #FFF9EE
Primary	Royal blue #4361EE
Secondary	Teal #2EC4B6
Accent	Sunny yellow #FFD166
Celebration	Coral #FF6B6B
Text	Deep navy #1B2542
Cards	White, rounded 2xl/`3xl`, soft shadows
Controls	Large, keyboard-friendly, visible focus ring


Animation plan
- Landing page: gently floating word bubbles; staggered heading appearance; playful button hover.
- Scrolling: sections fade/slide into view using Intersection Observer or a small animation library; avoid huge parallax effects.
- Words: flip-card meaning reveal, small letter bounce and smooth card transitions.
- Calendar: day-cell hover/tap, progress pulse for today, completed checkmark reveal.
- Mini-games: question entrance, selected-answer highlight, restrained success sparkle and gentle error cue.
- Results: short confetti/stars and animated score count-up.
Implementation note: Tailwind handles styling and simple transitions. Use CSS keyframes plus the browser's Intersection Observer for MVP; consider motion (React animation library) only if more complex sequencing is needed. lucide-react supplies icons, not animations by itself.

Accessibility and performance: honor prefers-reduced-motion, never rely solely on animation or color to communicate correctness, ensure keyboard access, use visible focus states, and avoid motion that interferes with reading. Use lightweight vector/CSS decorations rather than large autoplay videos.
8. Setup in VS Code
Requirements: a supported current Node.js LTS version, npm, VS Code and a Firebase project.
npm create vite@latest oasys-five-words -- --template react
cd oasys-five-words
npm install
npm install react-router-dom firebase lucide-react
npm install tailwindcss @tailwindcss/vite
npm run dev
Tailwind with Vite
In vite.config.js:
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
In src/styles/index.css:
@import "tailwindcss";
Import the stylesheet from src/main.jsx:
import './styles/index.css';
Firebase setup
1. Create a Firebase project and register a Web app in the Firebase console.
2. Enable Authentication → Anonymous.
3. Create a Cloud Firestore database and deploy restrictive Security Rules before inviting users.
4. Copy your app's Firebase web configuration into a local .env file.
5. Set up Firebase Hosting and, if used, Cloud Functions/Emulator Suite.
Example .env.example (replace placeholders locally):
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-web-app-id
VITE_CHALLENGE_TIMEZONE=UTC
Firebase web config values are app identifiers, not server secrets. Still, never commit service-account private keys or admin credentials. Any environment variable beginning VITE_ is embedded in the browser bundle and is publicly readable. .env should remain ignored by Git.

Example src/services/firebase.js:
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
Scripts
npm run dev       # Local Vite development server
npm run build     # Generate production assets in dist/
npm run preview   # Preview the production build locally
For Firebase Hosting, configure the SPA rewrite so React Router paths such as /calendar and /results/2026-11-07 return index.html. Use the Firebase CLI for deployment, with the build output directory set to dist.
9. Core application logic
Fetch today's content
1. Get the current date in the configured challenge timezone.
2. Read dailyChallenges/{dateKey}.
3. Ensure its status is published and it references exactly five unique IDs.
4. Load the five words documents; verify all required content exists.
5. Restore existing user progress, if present.
6. Use the fetched set for exploration and all three games; preserve the challenge version for reproducible results.
Keep question order stable
- Build a question set once per attempt.
- Shuffle with a saved seed or persist question/choice order as part of the attempt.
- Do not shuffle on every React render or page refresh.
- Avoid duplicate or obviously ambiguous answer choices.
Results and score persistence
For a robust public launch, the client submits the learner's answer IDs/text to a trusted Cloud Function. The function reads the published daily content, checks the attempt's status, computes score, and writes the final result atomically. The browser displays the returned score. This also prevents duplicate submissions from generating additional points.

For an initial offline UI prototype, pure client-side scoring is acceptable, but label it a prototype and do not treat its Firestore results as secure competition scores.
State handling
Provide friendly states for Loading, No words published, Offline, Save failed, Already completed, and Resume your challenge. Never silently mark a challenge completed when saving fails.
10. Delivery roadmap
- [ ] Phase 1: Foundation — Create Vite app, Tailwind setup, routes, Firebase configuration and common UI components.
- [ ] Phase 2: Visual experience — Build animated welcome page, calendar UI, word cards and responsive layout.
- [ ] Phase 3: Vocabulary backend — Define Firestore documents, write content validation/seed process and fetch daily sets.
- [ ] Phase 4: Three mini-games — Implement matching, gap-fill and spelling with 5 questions each.
- [ ] Phase 5: Progress — Implement /15 scoring, attempt resume, calendar completion and results page.
- [ ] Phase 6: Security — Authentication, Firestore rules, trusted final scoring, content publishing permissions and abuse controls.
- [ ] Phase 7: Polish — Scroll animation, reduced-motion testing, performance, keyboard/touch usability and responsive testing.
- [ ] Phase 8: Launch — Test timezone rollover, publish enough daily word sets, deploy, and verify on mobile and desktop.
11. Acceptance checklist
- [ ] Welcome page displays the required headline and a working entry button.
- [ ] Calendar distinguishes completed, today, missed, upcoming and unpublished dates.
- [ ] Today always resolves to five consistent published words, not five new random words on refresh.
- [ ] Explore mode reveals meanings and examples without changing the score.
- [ ] Match, Fill and Spell each contain five scored questions.
- [ ] Maximum total is 15, with no duplicate points on retries or refresh.
- [ ] Final results persist and update the completed calendar date.
- [ ] A learner cannot read or modify another learner's progress.
- [ ] Only authorized admins can publish/edit words or daily challenges.
- [ ] Missing content, network failures and unfinished attempts have useful recovery screens.
- [ ] Motion is playful, optional for reduced-motion users and does not block accessibility.
- [ ] Daily rollover works in the chosen challenge timezone.
- [ ] Desktop, tablet and mobile layouts are tested.
12. Future ideas (not required for MVP)
- Optional linked accounts for syncing between devices.
- Badges, milestones and weekly learning summaries.
- Audio pronunciation and phonics support.
- Difficulty/age-level tracks, each with its own daily five-word set.
- Teacher/parent dashboards with privacy-conscious aggregate progress.
- Admin panel for writing, reviewing and scheduling vocabulary.
- Offline practice using previously downloaded word sets.
- Backlog challenges for missed days (with explicit scoring and streak rules).
The first release should prioritize one reliable daily set of five words, three complete games, trustworthy progress, and a delightful learning experience.