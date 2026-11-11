import '../../style/SortDropdown.css';

const SortDropdown = ({ sortOrder, setSortOrder }) => (
  <div className="community-review-sort">
    <label htmlFor="community-review-sort">Sort by rank</label>
    <select
      id="community-review-sort"
      className="ffrh-field"
      value={sortOrder}
      onChange={event => setSortOrder(event.target.value)}
    >
      <option value="asc">Best to worst</option>
      <option value="desc">Worst to best</option>
    </select>
  </div>
);

export default SortDropdown;
