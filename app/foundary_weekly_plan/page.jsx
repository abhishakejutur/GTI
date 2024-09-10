"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';
import Nav from '@/components/Nav';

const Page = () => {
  const [boms, setBoms] = useState([]);
  const [displayedBoms, setDisplayedBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editBom, setEditBom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const empId = localStorage.getItem('emp_id');
    if (empId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      alert('Please login to access this page.');
      router.push('/'); 
    }
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchBOMs = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/data', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setBoms(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchBOMs();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return; 

    const filteredBoms = boms.filter(bom =>
      Object.values(bom).some(value =>
        (value ? value.toString().toLowerCase() : '').includes(searchQuery.toLowerCase())
      )
    );

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedBoms(filteredBoms.slice(start, end));
  }, [boms, currentPage, itemsPerPage, searchQuery, isLoggedIn]);

  const totalPages = Math.ceil(boms.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (bom) => {
    setEditBom(bom);
    setIsEditPopupOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/delete?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete BOM');

      setBoms((prevBoms) => prevBoms.filter((bom) => bom.Id !== id));
    } catch (error) {
      console.error('Error deleting BOM:', error);
      alert('Error deleting BOM: ' + error.message);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editBom.Id, data: editBom }),
      });
      if (!response.ok) throw new Error('Failed to update BOM');
      const updatedBom = await response.json();
      setBoms((prevBoms) =>
        prevBoms.map((bom) => (bom.Id === updatedBom.Id ? updatedBom : bom))
      );
      setIsEditPopupOpen(false);
    } catch (error) {
      console.error('Error updating BOM:', error);
      alert('Error updating BOM: ' + error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditBom({ ...editBom, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPaginationButtons = () => {
    const pageNumbers = [];
    const maxPagesToShow = 2;
    const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(currentPage - halfMaxPagesToShow, 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (startPage > 1) {
      pageNumbers.unshift('...');
    }
    if (endPage < totalPages) {
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (!isLoggedIn) {
    return null; 
  }

  return (
    <div className="container">
      <Nav />
      <br /><br /><br /><br />
      <div className='title_search'>
        <div className='title'>
          <h1>Foundary-WeeklyPlan</h1>
        </div>
        <div className="search-container">
          <label htmlFor="search" className="search-label">Search: </label>
          <input
            id="search"
            className="search-input"
            type="search"
            placeholder="Search here..."
            value={searchQuery}
            onChange={handleSearchChange}
          /><br />
        </div>
      </div>
      <div>
        <select className='selects' onChange={handleItemsPerPageChange} value={itemsPerPage}>
          <option value="1">1 row</option>
          <option value="5">5 rows</option>
          <option value="10">10 rows</option>
          <option value="50">50 rows</option>
          <option value={boms.length}>All</option>
        </select>
      </div>
      <table className="bom-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Week No</th>
            <th>Year No</th>
            <th>Part Number</th>
            <th>BOM Id</th>
            <th>BOM Code</th>
            <th>BOM Version</th>
            <th>Quantity</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
            <th>Sunday</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {displayedBoms.length > 0 ? (
            displayedBoms.map((bom) => (
              <tr key={bom.Id}>
                <td>{bom.Id}</td>
                <td>{bom.Week_No}</td>
                <td>{bom.Year_No}</td>
                <td>{bom.Part_Number}</td>
                <td>{bom.BOM_Id}</td>
                <td>{bom.BOM_Code}</td>
                <td>{bom.Bom_Version}</td>
                <td>{bom.Quantity}</td>
                <td>{bom.Monday}</td>
                <td>{bom.Tuesday}</td>
                <td>{bom.Wednesday}</td>
                <td>{bom.Thursday}</td>
                <td>{bom.Friday}</td>
                <td>{bom.Saturday}</td>
                <td>{bom.Sunday}</td>
                <td>
                  <button className="edit-button" onClick={() => handleEdit(bom)}>Edit</button>
                </td>
                <td>
                  <button className="delete-button" onClick={() => handleDelete(bom.Id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="20">No data available</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination-status-container">
        <div className="status-bar">
          <p>
            Showing {displayedBoms.length} of {boms.length} rows - Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="pagination">
          <button
            className="pagination-button prev-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Previous
          </button>
          {getPaginationButtons().map((page, index) => (
            page === '...' ? (
              <span key={index} className="pagination-dots">...</span>
            ) : (
              <button
                key={index}
                className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            )
          ))}
          <button
            className="pagination-button next-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next &raquo;
          </button>
        </div>
      </div>

      {isEditPopupOpen && editBom && (
        <div className="edit-popup">
          <div className="popup-content">
            <h2>Edit BOM</h2>

            <label>
              Id:
              <br /><input name="Id" value={editBom.Id} onChange={handleInputChange} readOnly />
            </label>

            <div className='popfields'>
            <div className='popleft'>
            <label>
              Week No:
              <input name="Week_No" value={editBom.Week_No} onChange={handleInputChange} />
            </label>

            <label>
              Year No:
              <input name="Year_No" value={editBom.Year_No} onChange={handleInputChange} />
            </label>

            <label>
              Part Number:
              <input name="Part_Number" value={editBom.Part_Number} onChange={handleInputChange} />
            </label>

            <label>
              BOM Id:
              <input name="BOM_Id" value={editBom.BOM_Id} onChange={handleInputChange} />
            </label>

            <label>
              BOM Code:
              <input name="BOM_Code" value={editBom.BOM_Code} onChange={handleInputChange} />
            </label>

            <label>
              BOM Version:
              <input name="Bom_Version" value={editBom.Bom_Version} onChange={handleInputChange} />
            </label>

            <label>
              Quantity:
              <input name="Quantity" value={editBom.Quantity} onChange={handleInputChange} />
            </label>
            </div>

            <div className='popright'>
            <label>
              Monday:
              <input name="Monday" value={editBom.Monday} onChange={handleInputChange} />
            </label>

            <label>
              Tuesday:
              <input name="Tuesday" value={editBom.Tuesday} onChange={handleInputChange} />
            </label>

            <label>
              Wednesday:
              <input name="Wednesday" value={editBom.Wednesday} onChange={handleInputChange} />
            </label>

            <label>
              Thursday:
              <input name="Thursday" value={editBom.Thursday} onChange={handleInputChange} />
            </label>

            <label>
              Friday:
              <input name="Friday" value={editBom.Friday} onChange={handleInputChange} />
            </label>

            <label>
              Saturday:
              <input name="Saturday" value={editBom.Saturday} onChange={handleInputChange} />
            </label>

            <label>
              Sunday:
              <input name="Sunday" value={editBom.Sunday} onChange={handleInputChange} />
            </label>
            </div>
            </div>

            <div className='popbuttons'>
            <button onClick={handleEditSubmit}>Submit</button>
            <button onClick={() => setIsEditPopupOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
