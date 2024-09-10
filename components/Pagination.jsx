// components/Pagination.jsx

import React from 'react';
import './Pagination.css'; // Create this file for pagination styles

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div className="pagination">
      <button 
        onClick={() => handlePageClick(currentPage - 1)} 
        disabled={currentPage === 1}
        className="pagination-button"
      >
        Previous
      </button>
      {[...Array(totalPages).keys()].map((page) => (
        <button
          key={page}
          onClick={() => handlePageClick(page + 1)}
          className={`pagination-button ${currentPage === page + 1 ? 'active' : ''}`}
        >
          {page + 1}
        </button>
      ))}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
