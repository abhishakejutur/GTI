"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';
import Nav from '@/components/Nav';

const Page = () => {
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
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

    const fetchProducts = async () => {
      try {
        const response = await fetch('http://10.40.20.98:82/api/Productmatrix', {
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return; 

    const filteredProducts = products.filter(product =>
      Object.values(product).some(value =>
        (value ? value.toString().toLowerCase() : '').includes(searchQuery.toLowerCase())
      )
    );

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedProducts(filteredProducts.slice(start, end));
  }, [products, currentPage, itemsPerPage, searchQuery, isLoggedIn]);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setIsEditPopupOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const response = await fetch(`http://10.40.20.98:82/api/Productmatrix?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');

      setProducts((prevProducts) => prevProducts.filter((product) => product.product_Id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + error.message);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch('http://10.40.20.98:82/api/Productmatrix/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editProduct.product_Id, data: editProduct }),
      });
      if (!response.ok) throw new Error('Failed to update product');
      const updatedProduct = await response.json();
      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.product_Id === updatedProduct.product_Id ? updatedProduct : product))
    );
    setIsEditPopupOpen(false);
  } catch (error) {
    console.error('Error updating product:', error);
    alert('Error updating product: ' + error.message);
  }
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setEditProduct({ ...editProduct, [name]: value });
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
  <div className="page-container">
    <Nav /><br /><br /><br /><br /><br />
    <div className='header-section'>
      <h1 className='page-title'>Product Matrix</h1><br />
      <div className="search-area">
        <label htmlFor="search" className="search-label">Search: </label>
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
    <div className="items-per-page">
      <select className='items-select' onChange={handleItemsPerPageChange} value={itemsPerPage}>
        <option value="1">1 row</option>
        <option value="5">5 rows</option>
        <option value="10">10 rows</option>
        <option value="50">50 rows</option>
        <option value={products.length}>All</option>
      </select>
    </div>
    <div className="table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th>Product Id</th>
            <th>Project</th>
            <th>Status</th>
            <th>Customer</th>
            <th>Part Description</th>
            <th>Cast RR</th>
            <th>Mach RR</th>
            <th>Assy RR</th>
            <th>Location</th>
            <th>Material</th>
            <th>Material Rev</th>
            <th>Cast Part No</th>
            <th>Cast Drawing Rev</th>
            <th>Cast Part Rev</th>
            <th>Cast Weight</th>
            <th>Cast Approval</th>
            <th>Mach Part No</th>
            <th>Mach Drawing Rev</th>
            <th>Mach Part Rev</th>
            <th>Mach Weight</th>
            <th>Mach Approval</th>
            <th>Assy Part No</th>
            <th>Assy Drawing Rev</th>
            <th>Assy Part Rev</th>
            <th>Assy Weight</th>
            <th>Assy Approval</th>
            <th>Ship Part No</th>
            <th>HS Part No</th>
            <th>Project Status</th>
            <th>SOP Date</th>
            <th>PMPD</th>
            <th>Sale Type</th>
            <th>Install Capacity</th>
            <th>Box Quantity</th>
            <th>Created Date</th>
            <th>Created By</th>
            <th>Updated Date</th>
            <th>Updated By</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <tr key={product.product_Id}>
                <td>{product.product_Id}</td>
                <td>{product.project}</td>
                <td>{product.status}</td>
                <td>{product.customer}</td>
                <td>{product.partDesc}</td>
                <td>{product.castRR}</td>
                <td>{product.machRR}</td>
                <td>{product.assyRR}</td>
                <td>{product.location}</td>
                <td>{product.material}</td>
                <td>{product.matRev}</td>
                <td>{product.castPartNo}</td>
                <td>{product.castDrawRev}</td>
                <td>{product.castPartRev}</td>
                <td>{product.castWeight}</td>
                <td>{product.castApproval}</td>
                <td>{product.machPartNo}</td>
                <td>{product.machDrawRev}</td>
                <td>{product.machPartRev}</td>
                <td>{product.machWeight}</td>
                <td>{product.machApproval}</td>
                <td>{product.assyPartNo}</td>
                <td>{product.assyDrawRev}</td>
                <td>{product.assyPartRev}</td>
                <td>{product.assyWeight}</td>
                <td>{product.assyApproval}</td>
                <td>{product.shipPartNo}</td>
                <td>{product.hsPartNo}</td>
                <td>{product.projStatus}</td>
                <td>{product.sopDate}</td>
                <td>{product.pmpd}</td>
                <td>{product.saleType}</td>
                <td>{product.installCap}</td>
                <td>{product.boxQty}</td>
                <td>{product.createdDate}</td>
                <td>{product.createdBy}</td>
                <td>{product.updatedDate}</td>
                <td>{product.updatedBy}</td>
                <td>
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(product.product_Id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="35">No products found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div><br /><br />
    <div className='psc'>
      <div><br />
        <span className="pagination-info">
          Showing {displayedProducts.length} of {products.length} rows - Page {currentPage} of {totalPages}
        </span>
      </div>

    <div className="pagination-container">
      <button
        className="pagination-button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &laquo; Prev
      </button>
      {getPaginationButtons().map((page, index) => (
        <button
          key={index}
          className={`pagination-button ${page === currentPage ? 'active' : ''}`}
          onClick={() => page !== '...' && handlePageChange(page)}
        >
          {page}
        </button>
      ))}
      <button
        className="pagination-button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next &raquo;
      </button>
    </div>
    </div>
    {isEditPopupOpen && (
      <div className="edit-popup">
        <div className="edit-popup-content">
          <h2>Edit Product</h2>
          <label htmlFor="product_Id">Product ID</label>
          <input
            id="product_Id"
            name="product_Id"
            type="text"
            value={editProduct.product_Id || ''}
            readOnly
          />
          <label htmlFor="project">Project</label>
          <input
            id="project"
            name="project"
            type="text"
            value={editProduct.project || ''}
            onChange={handleInputChange}
          />
          {/* Add more input fields as needed */}
          <div className="edit-popup-buttons">
            <button onClick={handleEditSubmit}>Save</button>
            <button onClick={() => setIsEditPopupOpen(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default Page;
