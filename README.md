# Fantasy Football Research Hub

## Overview

Fantasy Football Research Hub (FFRH) is a full‑stack web application designed to empower fantasy football enthusiasts. It offers community‑driven player rankings, detailed reviews, and in‑depth player analysis to help users manage their fantasy teams and strategize effectively.

## Features

- **Player Rankings:**  
  Users can rank NFL players (e.g., on a scale of 1–10) and view community-driven rankings updated in real‑time.

- **User Reviews:**  
  Registered users can write reviews for NFL players, providing personal insights and opinions. Reviews are truncated by default (with a “Show Review” toggle) and are limited to 450 characters.

- **Player Statistics & Analysis:**  
  Detailed statistics (stored in JSON format) are available for each player, allowing for extensive analysis.

- **Community Insights:**  
  View aggregated rankings and reviews to compare opinions and performance insights among users.

- **Responsive Design:**  
  A clean, vibrant, and responsive UI with separate optimizations for desktop (using react‑window for efficient rendering) and mobile devices (using a standard scrollable list).

- **Enhanced User Experience:**  
  - Filtering and sorting controls for reviews by team, position, or ranking.  
  - Modal dialogs for editing reviews to keep the interface focused.  
  - A 3‑dot action menu for each review (with Edit and Delete options) styled consistently with the profile menu.

## Tech Stack & Architecture

### Frontend

- **Framework & Build Tool:**  
  - React with Vite (for fast builds and modern optimizations).

- **State Management:**  
  - Redux (for managing global state across rankings, reviews, users, and authentication).

- **Form Handling & Validation:**  
  - Formik with Yup (including validation such as a 450‑character limit on reviews).

- **API Communication:**  
  - Axios (all API calls include `withCredentials` for secure, authenticated communication).

- **Routing:**  
  - React Router (client‑side routing for pages such as Home, Player Details, Reviews, Rankings, Profile, Registration, and Login).

- **Styling:**  
  - Custom CSS is used to create a visually appealing design with vibrant cyan accents and responsive layouts.

### Backend

- **Framework:**  
  - Flask with Flask‑RESTful to build a robust set of API endpoints.

- **Database & ORM:**  
  - PostgreSQL (hosted on Render) for data storage.  
  - SQLAlchemy as the ORM to manage database models and relationships.

- **Authentication & Security:**  
  - JWT‑based authentication using Flask‑JWT‑Extended.  
  - Passwords are securely hashed using bcrypt.  
  - Proper authorization checks ensure that users can only modify their own content.

- **File Storage:**  
  - AWS S3 for storing user‑uploaded profile pictures (with pre‑signed URLs for secure access).

### Deployment

- **Frontend:**  
  - Deployed on Render (Vite‑built React app).

- **Backend:**  
  - Flask API hosted on Render, configured for secure communication with the frontend (using proper CORS settings or shared domains).

- **Database:**  
  - PostgreSQL hosted on Render.

- **Static File Hosting:**  
  - User‑uploaded images stored on AWS S3.

- **Environment Variables:**  
  - Managed via a `.env` file (example keys include `DATABASE_URL`, `SECRET_KEY`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`).

## Database Schema & Relationships

### User
- **Fields:**  
  - `id` (PK), `username`, `email`, `password` (hashed), `profilePic`, `isFake` (Boolean flag to mark seeded fake accounts).
- **Relationships:**  
  - One-to-many with **Review**.  
  - Many-to-many with **Ranking**.

### Player
- **Fields:**  
  - `id` (PK), `name`, `position`, `team`, `stats` (JSON field for detailed player statistics).
- **Relationships:**  
  - One-to-many with **Review**.  
  - Many-to-many with **Ranking**.

### Review
- **Fields:**  
  - `id` (PK), `content`, `user_id` (FK to User), `player_id` (FK to Player).
- **Relationships:**  
  - Many-to-one with **User**.  
  - Many-to-one with **Player**.

### Ranking
- **Fields:**  
  - `id` (PK), `user_id` (FK to User), `player_id` (FK to Player), `rank` (Integer, typically between 1–10).
- **Relationships:**  
  - Represents a many-to-many relationship between **User** and **Player**.

## API Endpoints

### User Authentication
- **POST /register:** Register a new user.
- **POST /login:** Authenticate and return a JWT token.
- **GET /profile:** Retrieve the authenticated user's profile.

### Player Management
- **GET /players:** Fetch all players and their statistics.
- **GET /players/:id:** Fetch detailed information for a specific player.
- **POST /players:** Create a new player.
- **PUT /players/:id:** Update player details.
- **DELETE /players/:id:** Delete a player.

### Review System
- **GET /reviews/:player_id:** Fetch all reviews for a specific player.
- **POST /reviews:** Add a review (authentication required).
- **DELETE /reviews/:id:** Delete a review (authentication required).

### Ranking System
- **GET /rankings/:player_id:** Fetch rankings for a specific player.
- **POST /rankings:** Submit a ranking (authentication required).
- **DELETE /rankings/:id:** Delete a ranking (authentication required).

## Frontend Routes (React Router)

- `/` – Homepage.
- `/players` – List all players.
- `/players/:id` – Detailed player page (includes reviews, rankings, and statistics).
- `/add-review/:playerId` – Page to add a review.
- `/ranking` – Page to rank players.
- `/profile` – User profile page.
- `/register` – Registration page.
- `/login` – Login page.

## Installation and Setup

### Prerequisites

- **Python 3.8+**
- **Node.js** and **npm**
- **PostgreSQL** (or SQLite for local development)

### Backend Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/fantasy-football-research-hub.git
   cd fantasy-football-research-hub

2. **Create and activate a virtual environment:**
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate

3. **Install backend dependencies:**
   pip install -r requirements.txt

4. **Set up the database:**
   flask db upgrade

5. **Run the backend server:**
   flask run


### Frontend Setup

1. **Navigate to the frontend folder:**
   cd client

2. **Install dependencies:**
   npm install

3. **Run the frontend development server:**
   npm run dev


### Environment Variables

1. **Create a .env file in the root directory with configurations such as:**
   DATABASE_URL=postgresql://user:password@host/dbname
   SECRET_KEY=your-secret-key
   AWS_ACCESS_KEY_ID=your-aws-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret


Usage
After setting up and running both the frontend and backend, navigate to http://localhost:5173 (or your configured domain) to access the Fantasy Football Research Hub. You can register for an account, log in, browse players, write reviews, and submit rankings.

Contributing
Contributions are welcome!

Feel free to open pull requests for bug fixes, new features, or improvements.
Please ensure your changes are well-tested and align with the project’s coding style.
Contact
For questions or collaboration inquiries, please contact Jonathan Marshall at jwmarsh16@gmail.com.


## Future Improvements
**Live Data Integration:**
Real-time player stats and injury updates via external APIs (e.g., Sleeper, SportsRadar).

**Mobile App:**
Development of a mobile version using React Native.

**AI-Powered Draft Assistant:**
Utilize machine learning to suggest optimal draft picks.

**Video Analysis Hub:**
Enable users to upload or embed videos (e.g., YouTube) for detailed player performance breakdowns.

**Admin Panel:**
Create an administrative interface for managing players, reviews, and rankings.

**Additional UX Enhancements:**
Further improvements to filtering, sorting, and dynamic content adjustments based on user feedback.








































