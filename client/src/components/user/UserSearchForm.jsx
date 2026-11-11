function UserSearchForm({ searchUsername, setSearchUsername }) {
  return (
    <form className="user-list-search" role="search" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="user-list-username">Search by username</label>
      <input
        id="user-list-username"
        type="search"
        className="ffrh-field"
        value={searchUsername}
        onChange={(event) => setSearchUsername(event.target.value)}
      />
    </form>
  );
}

export default UserSearchForm;
