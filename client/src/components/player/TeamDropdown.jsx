// src/components/player/TeamDropdown.jsx
const TeamDropdown = ({ teams, selectedTeam, onChange }) => {
  return (
    <label className="player-list-field">
      Filter by Team:
      <select className="ffrh-field" value={selectedTeam} onChange={onChange}>
        <option value="">All Teams</option>
        {teams.map(team => <option key={team} value={team}>{team}</option>)}
      </select>
    </label>
  );
};

export default TeamDropdown;
