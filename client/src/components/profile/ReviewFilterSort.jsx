import '../../style/ReviewFilterSort.css';

function ReviewFilterSort({
  teams,
  positions,
  sortType,
  filterTeam,
  filterPosition,
  handleFilterByTeam,
  handleFilterByPosition,
  handleSortChange,
  handleClearFilters
}) {
  return (
    <div className="review-filter-sort">
      <div className="review-filter-sort__positions" role="group" aria-label="Filter by position">
        {positions.map((position) => (
          <button
            type="button"
            key={position}
            className="ffrh-button ffrh-button--secondary review-filter-sort__position"
            aria-pressed={filterPosition === position}
            onClick={() => handleFilterByPosition(position)}
          >
            {position}
          </button>
        ))}
      </div>

      <label className="review-filter-sort__field review-filter-sort__team">
        Filter by team
        <select className="ffrh-field" value={filterTeam} onChange={handleFilterByTeam}>
          <option value="">All teams</option>
          {teams.map((team) => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </label>

      <label className="review-filter-sort__field">
        Sort by
        <select className="ffrh-field" value={sortType} onChange={handleSortChange}>
          <option value="ranking">Ranking</option>
          <option value="team">Team</option>
          <option value="position">Position</option>
        </select>
      </label>

      <button
        type="button"
        onClick={handleClearFilters}
        className="ffrh-button ffrh-button--secondary"
        disabled={!filterTeam && !filterPosition && sortType === 'ranking'}
      >
        Clear Filters
      </button>
    </div>
  );
}

export default ReviewFilterSort;
