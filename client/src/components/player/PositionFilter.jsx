import React from 'react';
import '../../style/PositionFilter.css';

const PositionFilter = ({ positions, onFilter }) => {
  return (
    <div className="position-filter-container">
      {positions.map((position) => (
        <button
          key={position}
          className="position-filter-circle"
          onClick={() => onFilter(position)}
        >
          {position}
        </button>
      ))}
    </div>
  );
};

export default PositionFilter;
