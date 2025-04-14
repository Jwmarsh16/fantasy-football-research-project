import React from 'react';

function UserSearchForm({ searchUsername, setSearchUsername }) {
  return (
    <form className="search-form" onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        className="search-input"
        placeholder="Search by username"
        value={searchUsername}
        onChange={(e) => setSearchUsername(e.target.value)}
      />
    </form>
  );
}

export default UserSearchForm;
