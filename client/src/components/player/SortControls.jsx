// src/components/player/SortControls.jsx
const SortControls = ({ sortType, onSortChange }) => {
  return (
    <label className="player-list-field">
      Sort by:
      <select className="ffrh-field" value={sortType} onChange={onSortChange}>
        <option value="">Default order</option>
        <option value="team">Team</option>
        <option value="position">Position</option>
        <option value="ranking">Ranking</option>
      </select>
    </label>
  );
};

export default SortControls;
