"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/components/ui.css';
import '@/components/permissions.css';
import Nav from '@/components/Nav';

const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  );
};

const Page = () => {
  const [boms, setBoms] = useState([]);
  const [displayedBoms, setDisplayedBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pageData, setPageData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [modifyAccess, setModifyAccess] = useState(0);
  const [permissions, setPermissions] = useState([]);
  const [accessStatus, setAccessStatus] = useState({});
  const router = useRouter();

  useEffect(() => {
    const empId = localStorage.getItem('emp_id');
    if (empId) {
      setIsLoggedIn(true);
      fetchEmployeeIds(empId);
    } else {
      alert('Please login to access this page.');
      router.push('/');
    }
  }, [router]);

  const fetchEmployeeIds = async (empId) => {
    try {
      const response = await fetch('/api/getAllUsers');
      const data = await response.json();
      setUsers(data);
      await fetchPageData(empId);
    } catch (error) {
      setError('Failed to fetch employee data');
      setLoading(false);
    }
  };

  const fetchPageData = async (empId) => {
    try {
      const response = await fetch('http://localhost:3000/api/getPages');
      const data = await response.json();
      setPageData(data);
      const permissionsData = data.map(page => ({ id: page.Page_Id, name: page.PageName }));
      setPermissions(permissionsData);

      const pageId = permissionsData.find(p => p.name === 'permissions')?.id;
      if (pageId) {
        await checkPageAccess(empId, pageId);
      }
    } catch (error) {
      setError('Failed to fetch page data');
      setLoading(false);
    }
  };

  const checkPageAccess = async (empId, pageId) => {
    try {
      const response = await fetch('http://localhost:3000/api/checkPageAccess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emp_id: empId, page_id: pageId }),
      });

      if (!response.ok) throw new Error('You do not have access for this page');
      const data = await response.json();
      setHasAccess(data.exists);
      setModifyAccess(data.Modify_Access);

      if (!data.exists) {
        alert('You do not have access to this page.');
        router.push('/');
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && hasAccess) {
      setLoading(false);
    }
  }, [isLoggedIn, hasAccess]);

  useEffect(() => {
    if (users.length > 0) {
      const constructedBoms = users.map(emp => ({
        Id: emp.EmployeeId,
        Page_No: null,
        Page_Access: false,
        Modify_Access: false,
      }));
      setBoms(constructedBoms);
    }
  }, [users]);

  useEffect(() => {
    if (!isLoggedIn || !hasAccess) return;
    const filteredBoms = boms.filter(bom =>
      bom.Id.toString().includes(searchQuery) ||
      (pageData.find(page => page.Page_Id === bom.Id)?.PageName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const validDisplayedBoms = filteredBoms.filter((bom, index) =>
      pageData[index] && pageData[index].Page_Id && pageData[index].PageName
    );

    const total = Math.ceil(validDisplayedBoms.length / itemsPerPage);
    const currentDisplayedBoms = validDisplayedBoms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    setDisplayedBoms(currentDisplayedBoms);
  }, [boms, searchQuery, currentPage, itemsPerPage, isLoggedIn, hasAccess, pageData]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(boms.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  const isSaveButtonActive = modifyAccess === 1;

  const getPaginationButtons = () => {
    const pageNumbers = [];
    const maxPagesToShow = 2;
    const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(currentPage - halfMaxPagesToShow, 1);
    let endPage = Math.min(startPage + maxPagesToShow - 1, Math.ceil(boms.length / itemsPerPage));

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    if (startPage > 1) pageNumbers.unshift('...');
    if (endPage < Math.ceil(boms.length / itemsPerPage)) {
      pageNumbers.push('...');
      pageNumbers.push(Math.ceil(boms.length / itemsPerPage));
    }
    return pageNumbers;
  };

  const handleCheckboxChange = (id, type) => {
    setAccessStatus(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [type]: !prev[id]?.[type], // Toggle the current value
      },
    }));
  };

  const handleEmpIdChange = async (empId) => {
    setSelectedEmpId(empId);
    if (empId) {
      try {
        const response = await fetch('http://localhost:3000/api/empAccess', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ empcode: empId }),
        });

        if (!response.ok) throw new Error('Failed to fetch access data');

        const data = await response.json();
        const updatedAccessStatus = {};

        // Initialize access status for all boms
        boms.forEach(bom => {
          const accessEntry = data.find(item => item.Page_Id === bom.Id);
          updatedAccessStatus[bom.Id] = {
            Page_Access: accessEntry ? accessEntry.Page_Access : false, // true/false based on fetched data
            Modify_Access: accessEntry ? accessEntry.Modify_Access === 1 : false,
          };
        });

        // Update access status for all pages
        setAccessStatus(updatedAccessStatus);
      } catch (error) {
        console.error(error);
      }
    } else {
      setAccessStatus({}); // Reset if no employee is selected
    }
  };

  return (
    <div className="container">
      <Nav /><br /><br /><br /><br /><br /><br />
      <div className="title_search">
        <h1>Permission settings</h1>
        <div className="search-container">
          <input
            id="search"
            className="search-input"
            type="search"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div><br /><br />
      <div className="select-container">
        <select className="selects" onChange={(e) => setItemsPerPage(Number(e.target.value))} value={itemsPerPage}>
          <option value="1">1 row</option>
          <option value="5">5 rows</option>
          <option value="10">10 rows</option>
          <option value="50">50 rows</option>
          <option value={boms.length}>All</option>
        </select>
        <select className="selects" onChange={(e) => handleEmpIdChange(e.target.value)} value={selectedEmpId}>
          <option value="">Select Employee ID</option>
          {users.map(user => (
            <option key={user.EmployeeId} value={user.EmployeeId}>{user.EmployeeId}</option>
          ))}
        </select>
      </div><br /><br />
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
                <th>Page ID</th>
                <th>Page Name</th>
                <th>Page Access</th>
                <th>Modify Access</th>
              </tr>
            </thead>
            <tbody>
              {displayedBoms.map((bom, index) => (
                <tr key={bom.Id}>
                  <td>{pageData[index]?.Page_Id}</td>
                  <td>{pageData[index]?.PageName}</td>
                  <td>
                    <ToggleSwitch
                      checked={accessStatus[bom.Id]?.Page_Access || false}
                      onChange={() => handleCheckboxChange(bom.Id, 'Page_Access')}
                    />
                  </td>
                  <td>
                    <ToggleSwitch
                      checked={accessStatus[bom.Id]?.Modify_Access || false}
                      onChange={() => handleCheckboxChange(bom.Id, 'Modify_Access')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
        <button className="edit-button" disabled={!isSaveButtonActive}>Save All Changes</button>
      </div>
      <div className='spb'>
        <div className="pagination-status">
          <p>
            Showing {displayedBoms.length} of {boms.length} rows - Page {currentPage} of {Math.ceil(boms.length / itemsPerPage)}
          </p>
        </div>
        <div className="pagination-buttons">
          <button className="pagination-button" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>&lt;&lt;</button>
          <button className="pagination-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&lt;</button>
          {getPaginationButtons().map((page, index) => (
            <button
              key={index}
              className={`pagination-button ${page === currentPage ? 'active' : ''}`}
              onClick={() => page !== '...' && handlePageChange(page)}
              disabled={page === '...'}
            >
              {page}
            </button>
          ))}
          <button className="pagination-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.ceil(boms.length / itemsPerPage)}>&gt;</button>
          <button className="pagination-button" onClick={() => handlePageChange(Math.ceil(boms.length / itemsPerPage))} disabled={currentPage === Math.ceil(boms.length / itemsPerPage)}>&gt;&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default Page;
