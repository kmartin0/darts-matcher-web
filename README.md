# Darts Matcher Web

Web application for creating, playing and sharing X01 darts matches using the Darts Matcher platform.

Demo hosted on a Raspberry Pi using Docker and nginx: https://dartsmatcher.kmartin.nl/

## Features

- Create 301 and 501 matches.
- Configure matches using sets or legs.
- Configure clear-by-two rules for sets, legs and final sets.
- Support up to four players.
- Play against configurable Dart Bot opponents.
- Track checkout attempts and checkout percentages.
- Enter scores using an integrated keypad.
- Display remaining scores, suggested checkouts, averages and match standings.
- Edit or undo previously entered scores.
- View match information, statistics and a complete match timeline.
- Reset, repair, delete and create rematches.
- Share matches using a match link or match ID.
- Synchronize match updates between clients in real time.
- Store recently visited matches locally with paginated match history.
- Configure which players are being scored for on each device.
- Light and dark mode.
- Responsive layouts for mobile and desktop.

## Technical Overview

- Angular.
- TypeScript.
- Angular Material and CDK.
- Angular Signals for application and page state.
- Angular Signal Forms with custom validation.
- REST API communication using `HttpClient`.
- STOMP over WebSocket for real-time match updates.
- IndexedDB persistence using Dexie.
- Centralized HTTP and WebSocket error handling.
- Feature-based application structure.
- Responsive SCSS styling.
- Docker multi-stage build served using nginx.

## Screenshots

<img src="https://github.com/kmartin0/assets/blob/master/darts-matcher-web/darts-matcher_home.png?raw=true" alt="Home screenshot" width="300" />

<img src="https://github.com/kmartin0/assets/blob/master/darts-matcher-web/darts-matcher_home-light.png?raw=true" alt="Home light mode screenshot" width="300" />

<img src="https://github.com/kmartin0/assets/blob/master/darts-matcher-web/darts-matcher_match.png?raw=true" alt="Match screenshot" width="300" />

<img src="https://github.com/kmartin0/assets/blob/master/darts-matcher-web/darts-matcher_match-light.png?raw=true" alt="Match light mode screenshot" width="300" />

<img src="https://github.com/kmartin0/assets/blob/master/darts-matcher-web/darts-matcher_match-score-for.png?raw=true" alt="Match score for screenshot" width="300" />

<img src="https://github.com/kmartin0/assets/blob/master/darts-matcher-web/darts-matcher_match-information.png?raw=true" alt="Match information screenshot" width="300" />

<img src="https://github.com/kmartin0/assets/blob/master/darts-matcher-web/darts-matcher_match-statistics.png?raw=true" alt="Match statistics screenshot" width="300" />

<img src="https://github.com/kmartin0/assets/blob/master/darts-matcher-web/darts-matcher_match-timeline.png?raw=true" alt="Match timeline screenshot" width="300" />

<img src="https://github.com/kmartin0/assets/blob/master/darts-matcher-web/darts-matcher_match-history.png?raw=true" alt="Match history screenshot" width="300" />

<img src="https://github.com/kmartin0/assets/blob/master/darts-matcher-web/darts-matcher_match-win.png?raw=true" alt="Match win screenshot" width="300" />
