import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserById, setUserDetails } from '../redux/slices/userSlice';
import { shuffleArray } from '../utils/homeUtils';

import UserCard from '../components/home/HomeUserCard';
import NewsSection from '../components/home/NewsSection';
import RankingSidebar from '../components/home/RankingSidebar';
import WelcomeSection from '../components/home/WelcomeSection';

import '../style/HomeStyle.css';

const mockNews = [
  {
    id: 1,
    title: "🚀 Fantasy Football Week 14: Must-Start Players",
    content:
      "Our experts break down the must-start players for this week, including a surprising breakout candidate at running back.",
    date: "2024-12-08",
    category: "Player Trends",
  },
  {
    id: 2,
    title: "🔄 Trade Rumors: Could This Star WR Be on the Move?",
    content:
      "Insider reports suggest a major trade could be happening soon. Find out how this could impact your fantasy team.",
    date: "2024-12-07",
    category: "Trade Rumors",
  },
  {
    id: 3,
    title: "🛑 Injury Report: Who’s Out for Week 14?",
    content:
      "Several big-name players are questionable heading into the week. See who's in, who's out, and how to adjust your lineup.",
    date: "2024-12-06",
    category: "Injury Report",
  },
  {
    id: 4,
    title: "🔥 Sleeper Picks: Under-the-Radar Players to Watch",
    content:
      "Looking for an edge? We highlight five sleeper picks who could deliver big performances this week.",
    date: "2024-12-05",
    category: "Sleeper Picks",
  },
  {
    id: 5,
    title: "📊 Fantasy Rankings Update: Who’s Climbing the Charts?",
    content:
      "Based on recent performances, some players are seeing major jumps in the rankings. Find out who’s trending up!",
    date: "2024-12-04",
    category: "Rankings",
  },
];

function Home() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.currentUser);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userDetails = useSelector((state) => state.user.userDetails);
  const userLoadingStatus = useSelector((state) => state.user.status);
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchUserById(user.id))
        .unwrap()
        .then((response) => {
          if (response) dispatch(setUserDetails(response));
        })
        .catch(console.error);
    }
  }, [isAuthenticated, user, dispatch]);

  const shuffledNews = shuffleArray(mockNews).slice(0, 3);

  // 👇 Prevent crash by checking both are loaded
  const loggedInUser =
    user?.id && userDetails?.id && user.id === userDetails.id
      ? userDetails
      : user;

  const avatarUrl =
    loggedInUser?.profilePic?.trim()
      ? loggedInUser.profilePic
      : "https://placehold.co/600x400?text=Upload+Picture";

  return (
    <div className="home-page">
      {userLoadingStatus === 'loading' ? (
        <p className="loading-message">Loading user information...</p>
      ) : isAuthenticated && loggedInUser ? (
        <UserCard
          avatarUrl={avatarUrl}
          username={loggedInUser?.username}
          email={loggedInUser?.email}
        />
      ) : null}

      <WelcomeSection />

      <div className={isAuthenticated ? 'home-content' : 'home-content home-content--guest'}>
        <RankingSidebar />
        {isAuthenticated && <NewsSection articles={shuffledNews} />}
      </div>
    </div>
  );
}

export default Home;
