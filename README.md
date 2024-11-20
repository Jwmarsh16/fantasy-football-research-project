# Fantasy Football Research Hub

## Overview
The Fantasy Football Research Hub is a full-stack web application designed to help fantasy football enthusiasts analyze player data, create rankings, and write reviews. This platform allows users to efficiently research players, manage their fantasy team strategy, and interact with other users by sharing reviews and rankings.

## Features
- **User Authentication**: Users can register, log in, and manage their profile securely using JSON Web Tokens (JWT) and hashed passwords.
- **Player Statistics**: View detailed statistics for each player, including position, team, and historical performance.
- **Rankings**: Users can rank players, providing their own assessment of each player's value. Rankings are validated to ensure they are within a reasonable range.
- **Reviews**: Write and read player reviews to gain insights from other users' experiences and opinions.
- **Responsive UI**: A clean, vibrant, and user-friendly interface designed with Vite for a fast, interactive experience.

## Technologies Used
### Frontend
- **React** with **Vite**: Used for creating dynamic and interactive user interfaces.
- **Redux Toolkit**: For managing global application state, including authentication and user details.
- **Axios**: For making API requests to the backend.
- **CSS Styling**: Custom CSS used to create a visually appealing design.

### Backend
- **Flask**: A Python microframework for handling server requests and managing backend logic.
- **Flask-RESTful**: To create RESTful API endpoints for player data, reviews, rankings, and authentication.
- **SQLAlchemy**: Object-relational mapper (ORM) for managing database interactions.
- **JWT (JSON Web Tokens)**: For handling secure user authentication.
- **bcrypt**: Used for password hashing to securely store user credentials.

### Database
- **PostgreSQL** (or **SQLite** in development): For storing users, players, reviews, and rankings data in a relational format.

## Installation and Setup
To get started with the Fantasy Football Research Hub locally, follow these steps:

### Prerequisites
- **Python 3.8+**
- **Node.js** and **npm**
- **PostgreSQL** (optional, can use SQLite for local development)

### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/fantasy-football-research-hub.git
   cd fantasy-football-research-hub
   ```
2. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate  # For Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Set up the database:
   ```sh
   flask db upgrade
   ```
5. Run the backend server:
   ```sh
   flask run
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd client
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the frontend development server:
   ```sh
   npm run dev
   ```

### Environment Variables
Create a `.env` file in the root directory and include the following configurations:
- `SECRET_KEY`: Used for encoding JWT tokens.
- `DATABASE_URL`: Connection string for PostgreSQL or SQLite.

## Usage
Once both servers are running, you can visit `http://localhost:5173` to access the Fantasy Football Research Hub. Register for an account, log in, and start browsing players, writing reviews, and creating rankings!

## API Endpoints
- **/api/auth/login** (POST): Login with email and password.
- **/api/auth/register** (POST): Register a new user.
- **/api/players** (GET): Get all players and their stats.
- **/api/players/:id** (GET): Get specific player information.
- **/api/reviews** (POST, GET): Create or fetch reviews.
- **/api/rankings** (POST, GET): Submit or fetch rankings.

## Contributing
If you would like to contribute to this project, feel free to open a pull request. All contributions are welcome, including bug fixes, new features, or general improvements to the application.

## Contact
For questions or collaboration inquiries, please contact **Jonathan Marshall** at jwmarsh16@gmail.com.

## Future Improvements
- **Player Comparison Tool**: Allow users to compare stats between multiple players side-by-side.
- **Leaderboard**: A community leaderboard showcasing top users based on reviews and rankings.
- **Notifications System**: Notify users of comments on their reviews or other relevant activities.

