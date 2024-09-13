"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../foundary_weekly_plan/page.css';

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
    <div className="container"><br /><br /><br /><br /><br />
      {loading ? (
        <div className="spinner">
          <div className="bounce1"></div>
          <div className="bounce2"></div>
          <div className="bounce3"></div>
        </div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="table-container">
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
                  <td colSpan="16">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Page;
