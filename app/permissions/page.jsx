"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/components/ui.css';
import '@/components/permissions.css';
import Nav from '@/components/Nav';

const Page = () => {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pageIds, setPageIds] = useState([]); 
  const router = useRouter();

  useEffect(() => {
    const empId = localStorage.getItem('emp_id');
    if (empId) {
      setIsLoggedIn(true);
    } else {
      alert('Please login to access this page.');
      router.push('/');
    }
  }, [router]);

  const fetchData = async () => {
    try {
      const idsResponse = await fetch('http://localhost:3000/api/getIds', { headers: { 'Cache-Control': 'no-cache' } });

      if (!idsResponse.ok) {
        const errorText = await idsResponse.text();
        throw new Error(`Failed to fetch IDs: ${errorText}`);
      }

      const idsData = await idsResponse.json();
      const constructedBoms = idsData.employeeAccess.map(emp => ({
        Id: emp.EmployeeId,
        PreviouspageAcess: emp.pagesAccess || null,
        Page_No: null,
        Page_Access: false,
        Modify_Access: false,
      }));

      setBoms(constructedBoms);
      setPageIds(idsData.pageIds);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchData(); // Call fetchData when the user is logged in
  }, [isLoggedIn]);

  const filteredBoms = boms.filter(bom =>
    bom.Id.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBoms.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const displayedBoms = filteredBoms.slice(start, start + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSave = async (bom) => {
    const response = await fetch('http://localhost:3000/api/permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        empId: bom.Id,
        pageId: bom.Page_No,
        pageAccess: bom.Page_Access,
        modifyAccess: bom.Modify_Access,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      await fetchData(); // Call fetchData here
      window.location.reload(); // Reload the page
    } else {
      alert(result.message);
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="container">
      <Nav /><br /><br /><br /><br /><br />
      <div className="title_search">
        <div className="title">
          <h1>Access Permissions</h1>
        </div>
        <div className="search-container">
          <input
            id="search"
            className="search-input"
            type="search"
            placeholder="Search here..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="select-container">
        <select className="selects" onChange={handleItemsPerPageChange} value={itemsPerPage}>
          <option value="1">1 row</option>
          <option value="5">5 rows</option>
          <option value="10">10 rows</option>
          <option value="50">50 rows</option>
          <option value={boms.length}>All</option>
        </select>
      </div>
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
                <th>Employee ID</th>
                <th>Previous Access Pages</th>
                <th>Page No</th>
                <th>Page Access</th>
                <th>Modify Access (Edit/Delete)</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {displayedBoms.length > 0 ? (
                displayedBoms.map(bom => (
                  <tr key={bom.Id}>
                    <td>{bom.Id}</td>
                    <td>{bom.PreviouspageAcess !== null ? bom.PreviouspageAcess : 'No Access'}</td>
                    <td>
                      <select
                        className="selects"
                        onChange={(e) => { bom.Page_No = e.target.value; setBoms([...boms]) }} // Update Page_No
                      >
                        <option value="">Select Page</option>
                        {pageIds.map(pageId => (
                          <option key={pageId} value={pageId}>{pageId}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        onChange={(e) => { bom.Page_Access = e.target.checked; setBoms([...boms]) }} // Update Page_Access
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        onChange={(e) => { bom.Modify_Access = e.target.checked; setBoms([...boms]) }} // Update Modify_Access
                      />
                    </td>
                    <td>
                      <button
                        style={{ width: "100%" }}
                        className="edit-button"
                        onClick={() => handleSave(bom)} 
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className='spb'>
        <div className="pagination-status">
          <p>
            Showing {displayedBoms.length} of {filteredBoms.length} rows - Page {currentPage} of {totalPages}
          </p>
        </div>
        <div className="pagination-buttons">
          <button className="pagination-button" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&lt;&lt;</button>
          <button className="pagination-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-button ${page === currentPage ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button className="pagination-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>&gt;</button>
          <button className="pagination-button" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>&gt;&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default Page;
