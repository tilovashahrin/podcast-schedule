# Podcast Calendar

Netlify Site: 
https://podcast-schedules.netlify.app/

## Overview

Podcast Calendar is a web application built with Vue.js and TypeScript that allows users to search for podcasts available on Spotify, select up to five podcasts, and view their episodes in a calendar format. The calendar supports both monthly and weekly views, with episodes color-coded by podcast for better visualization. Users can navigate the application using keyboard shortcuts, and clicking on an episode opens a pop-up modal with more details.

## Keys Include:
1. Tab to move across items
2. Shift + Tab to move back
3. Enter to select/deselect podcasts
4. Enter to open modal
5. Esc to close modal
   
## Design
Left Panel:
Search Bar and Podcast cards to select or deselect.

Right Panel:
Calendar with podcast episodes, can click to overview desription of episode.

<img width="767" alt="Screenshot 2025-03-10 at 2 21 48 PM" src="https://github.com/user-attachments/assets/3a79a2ec-0d4e-4561-a181-7d54b6e1857c" />


### Installation

1. Prerequisites:
- Node.js (>=16.0.0)
- npm or yarn

2. Setup & Run:
Clone the repository:

`git clone https://github.com/yourusername/podcast-calendar.git`
`cd podcast-calendar`

3. Install dependencies:
`npm install`
or
`yarn install`

4. Set up environment variables:
Create a .env file in the root directory.
Add the following environment variables:

`VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id`
`VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret`

5. Start the development server:

`npm run dev`
or
`yarn dev`

Open the app in your browser: http://localhost:5173

