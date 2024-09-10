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
  <div className="container">
    <Nav />
    <br /><br /><br /><br />
    <div className='title_search'>
      <div className='title'>
        <h1>Product Matrix</h1>
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
        />
      </div>
    </div>
    <div>
      <select className='selects' onChange={handleItemsPerPageChange} value={itemsPerPage}>
        <option value="1">1 row</option>
        <option value="5">5 rows</option>
        <option value="10">10 rows</option>
        <option value="50">50 rows</option>
        <option value={products.length}>All</option>
      </select>
    </div>
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
              <td>{product.projectStatus}</td>
              <td>{product.sopDate}</td>
              <td>{product.pmpd}</td>
              <td>{product.saleType}</td>
              <td>{product.installCapacity}</td>
              <td>{product.boxQuantity}</td>
              <td>{product.createdDate}</td>
              <td>{product.createdBy}</td>
              <td>{product.updatedDate}</td>
              <td>{product.updatedBy}</td>
              <td>
                <button onClick={() => handleEdit(product)}>Edit</button>
              </td>
              <td>
                <button onClick={() => handleDelete(product.product_Id)}>Delete</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="34">No products found</td>
          </tr>
        )}
      </tbody>
    </table>
    <div className='pagination'>
      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      {getPaginationButtons().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && handlePageChange(page)}
          className={typeof page === 'number' && page === currentPage ? 'active' : ''}
        >
          {page}
        </button>
      ))}
      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
    {isEditPopupOpen && editProduct && (
      <div className="popup">
        <h2>Edit Product</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }}>
          <input type="text" name="project" value={editProduct.project || ''} onChange={handleInputChange} />
          <input type="text" name="status" value={editProduct.status || ''} onChange={handleInputChange} />
          <input type="text" name="customer" value={editProduct.customer || ''} onChange={handleInputChange} />
          <input type="text" name="partDesc" value={editProduct.partDesc || ''} onChange={handleInputChange} />
          <input type="text" name="castRR" value={editProduct.castRR || ''} onChange={handleInputChange} />
          <input type="text" name="machRR" value={editProduct.machRR || ''} onChange={handleInputChange} />
          <input type="text" name="assyRR" value={editProduct.assyRR || ''} onChange={handleInputChange} />
          <input type="text" name="location" value={editProduct.location || ''} onChange={handleInputChange} />
          <input type="text" name="material" value={editProduct.material || ''} onChange={handleInputChange} />
          <input type="text" name="matRev" value={editProduct.matRev || ''} onChange={handleInputChange} />
          <input type="text" name="castPartNo" value={editProduct.castPartNo || ''} onChange={handleInputChange} />
          <input type="text" name="castDrawRev" value={editProduct.castDrawRev || ''} onChange={handleInputChange} />
          <input type="text" name="castPartRev" value={editProduct.castPartRev || ''} onChange={handleInputChange} />
          <input type="text" name="castWeight" value={editProduct.castWeight || ''} onChange={handleInputChange} />
          <input type="text" name="castApproval" value={editProduct.castApproval || ''} onChange={handleInputChange} />
          <input type="text" name="machPartNo" value={editProduct.machPartNo || ''} onChange={handleInputChange} />
          <input type="text" name="machDrawRev" value={editProduct.machDrawRev || ''} onChange={handleInputChange} />
          <input type="text" name="machPartRev" value={editProduct.machPartRev || ''} onChange={handleInputChange} />
          <input type="text" name="machWeight" value={editProduct.machWeight || ''} onChange={handleInputChange} />
          <input type="text" name="machApproval" value={editProduct.machApproval || ''} onChange={handleInputChange} />
          <input type="text" name="assyPartNo" value={editProduct.assyPartNo || ''} onChange={handleInputChange} />
          <input type="text" name="assyDrawRev" value={editProduct.assyDrawRev || ''} onChange={handleInputChange} />
          <input type="text" name="assyPartRev" value={editProduct.assyPartRev || ''} onChange={handleInputChange} />
          <input type="text" name="assyWeight" value={editProduct.assyWeight || ''} onChange={handleInputChange} />
          <input type="text" name="assyApproval" value={editProduct.assyApproval || ''} onChange={handleInputChange} />
          <input type="text" name="shipPartNo" value={editProduct.shipPartNo || ''} onChange={handleInputChange} />
          <input type="text" name="hsPartNo" value={editProduct.hsPartNo || ''} onChange={handleInputChange} />
          <input type="text" name="projectStatus" value={editProduct.projectStatus || ''} onChange={handleInputChange} />
          <input type="text" name="sopDate" value={editProduct.sopDate || ''} onChange={handleInputChange} />
          <input type="text" name="pmpd" value={editProduct.pmpd || ''} onChange={handleInputChange} />
          <input type="text" name="saleType" value={editProduct.saleType || ''} onChange={handleInputChange} />
          <input type="text" name="installCapacity" value={editProduct.installCapacity || ''} onChange={handleInputChange} />
          <input type="text" name="boxQuantity" value={editProduct.boxQuantity || ''} onChange={handleInputChange} />
          <input type="text" name="createdDate" value={editProduct.createdDate || ''} onChange={handleInputChange} />
          <input type="text" name="createdBy" value={editProduct.createdBy || ''} onChange={handleInputChange} />
          <input type="text" name="updatedDate" value={editProduct.updatedDate || ''} onChange={handleInputChange} />
          <input type="text" name="updatedBy" value={editProduct.updatedBy || ''} onChange={handleInputChange} />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setIsEditPopupOpen(false)}>Cancel</button>
        </form>
      </div>
    )}
  </div>
);
};

export default Page;

