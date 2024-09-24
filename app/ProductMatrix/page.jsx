"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/components/ui.css';
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
  const [hasAccess, setHasAccess] = useState(false);
  const [modifyAccess, setModifyAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const empId = localStorage.getItem('emp_id');
    if (empId) {
      setIsLoggedIn(true);
      fetchPages(empId);
    } else {
      alert('Please login to access this page.');
      router.push('/');
    }
  }, [router]);

  const fetchPages = async (empId) => {
    try {
      const response = await fetch('http://localhost:3000/api/getPages', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const pages = await response.json();
      const defaultPathname = 'ProductMatrix';
      const pageId = pages.find(page => page.PageName === defaultPathname)?.Page_Id;
      if (pageId) {
        checkPageAccess(empId, pageId);
      } else {
        alert('Page not found.');
      }
    } catch (error) {
      setError(error.message);
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
        body: JSON.stringify({ page_id: pageId, emp_id: empId }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setHasAccess(data.exists);
      setModifyAccess(data.Modify_Access === 1);
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
    if (!isLoggedIn || !hasAccess) return;

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
  }, [isLoggedIn, hasAccess]);

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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://10.40.20.98:82/api/Productmatrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
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

  if (!isLoggedIn || !hasAccess) {
    return null;
  }

  return (
    <div className="container">
      <Nav /><br /><br /><br /><br /><br />
      <div className="title_search">
        <div className="title">
          <h1>Product Matrix</h1>
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
          <option value={products.length}>All</option>
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
                <th>Assembly Part No</th>
                <th>Assembly Drawing Rev</th>
                <th>Assembly Part Rev</th>
                <th>Assembly Weight</th>
                <th>Assembly Approval</th>
                <th>Ship Part No</th>
                <th>HS Part No</th>
                <th>Project Status</th>
                <th>Sales Order Date</th>
                <th>PMPD</th>
                <th>Sale Type</th>
                <th>Installation Capacity</th>
                <th>Box Quantity</th>
                <th>Created By</th>
                <th>Updated By</th>
                <th>Created Date</th>
                <th>Updated Date</th>
                {modifyAccess && 
                  <th>Edit</th>
                }
                {modifyAccess && 
                  <th>Delete</th>
                }
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product) => (
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
                  <td>{product.matl_Rev}</td>
                  <td>{product.cast_PartNo}</td>
                  <td>{product.cast_Dwg_Rev}</td>
                  <td>{product.cast_Part_Rev}</td>
                  <td>{product.cast_Wt}</td>
                  <td>{product.cast_Appr}</td>
                  <td>{product.mach_PartNo}</td>
                  <td>{product.mach_Dwg_Rev}</td>
                  <td>{product.mach_Part_Rev}</td>
                  <td>{product.mach_Wt}</td>
                  <td>{product.mach_Appr}</td>
                  <td>{product.assy_PartNo}</td>
                  <td>{product.assy_Dwg_Rev}</td>
                  <td>{product.assy_Part_Rev}</td>
                  <td>{product.assy_Wt}</td>
                  <td>{product.assy_Appr}</td>
                  <td>{product.ship_PartNo}</td>
                  <td>{product.hS_PartNo}</td>
                  <td>{product.proj_Status}</td>
                  <td>{product.soP_Date}</td>
                  <td>{product.pmpd}</td>
                  <td>{product.saletype}</td>
                  <td>{product.installCapa}</td>
                  <td>{product.boxqty}</td>
                  <td>{product.createdBy}</td>
                  <td>{product.updatedBy}</td>
                  <td>{product.createdDate}</td>
                  <td>{product.updatedDate}</td>
                  {modifyAccess && (
                      <td>
                        <button className='edit-button' onClick={() => handleEdit(product)}>Edit</button>
                      </td>
                  )}
                  {modifyAccess && (
                      <td>
                      <button className='delete-button' onClick={() => handleDelete(product.product_Id)}>Delete</button>
                      </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className='spb'>
        <div className="pagination-status">
          <p>
            Showing {displayedProducts.length} of {products.length} rows - Page {currentPage} of {totalPages}
          </p>
        </div>
        <div className="pagination-buttons">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            &lt;&lt;
          </button>
        <button
          className="pagination-button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {getPaginationButtons().map((page, index) => (
        <button
          key={index}
          className={`pagination-button ${page === currentPage ? 'active' : ''}`}
          onClick={() => typeof page === 'number' && handlePageChange(page)}
          disabled={typeof page === 'string'}
        >
          {page}
        </button>
      ))}
      <button
        className="pagination-button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
      <button
        className="pagination-button"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        &gt;&gt;
      </button>
      </div>
    </div>


    {isEditPopupOpen && editProduct && (
      
      <div className="edit-popup">
      <div className="popup-content">
      <div className='close-title'><br /><br />
        {/* <span className="close" onClick={() => setIsEditPopupOpen(false)}>&times;</span><br /><br /><br /><br /><br /><br /><br /> */}
        <h2>Edit Product</h2>
      </div>

      <div className='popupID'>
        <label style={{ textAlign: "center", border: "2px solid black", padding: "2%", paddingLeft: "2%" }}>
          Id: {editProduct.product_Id}
        </label><br />
      </div>

      <div className='popfields'>
        <div className='popleft'>
          <label>
            Project:
            <input name="project" value={editProduct.project || ''} onChange={handleInputChange} />
          </label>

          <label>
            Status:
            <input name="status" value={editProduct.status || ''} onChange={handleInputChange} />
          </label>

          <label>
            Customer:
            <input name="customer" value={editProduct.customer || ''} onChange={handleInputChange} />
          </label>

          <label>
            Part Description:
            <input name="partDesc" value={editProduct.partDesc || ''} onChange={handleInputChange} />
          </label>

          <label>
            Location:
            <input name="location" value={editProduct.location || ''} onChange={handleInputChange} />
          </label>

          <label>
            Material:
            <input name="material" value={editProduct.material || ''} onChange={handleInputChange} />
          </label>

          <label>
            Material Rev:
            <input name="matl_Rev" value={editProduct.matl_Rev || ''} onChange={handleInputChange} />
          </label>

          <label>
            Cast Part No:
            <input name="cast_PartNo" value={editProduct.cast_PartNo || ''} onChange={handleInputChange} />
          </label>

          <label>
            Cast Drawing Rev:
            <input name="cast_Dwg_Rev" value={editProduct.cast_Dwg_Rev || ''} onChange={handleInputChange} />
          </label>

          <label>
            Cast Part Rev:
            <input name="cast_Part_Rev" value={editProduct.cast_Part_Rev || ''} onChange={handleInputChange} />
          </label>

          <label>
            Cast Weight:
            <input name="cast_Wt" type="number" step="any" value={editProduct.cast_Wt || ''} onChange={handleInputChange} />
          </label>

          <label>
            Cast Approval:
            <input name="cast_Appr" value={editProduct.cast_Appr || ''} onChange={handleInputChange} />
          </label>

          <label>
            Mach Part No:
            <input name="mach_PartNo" value={editProduct.mach_PartNo || ''} onChange={handleInputChange} />
          </label>

          <label>
            Mach Drawing Rev:
            <input name="mach_Dwg_Rev" value={editProduct.mach_Dwg_Rev || ''} onChange={handleInputChange} />
          </label>

          <label>
            Mach Part Rev:
            <input name="mach_Part_Rev" value={editProduct.mach_Part_Rev || ''} onChange={handleInputChange} />
          </label>

          <label>
            Mach Weight:
            <input name="mach_Wt" type="number" step="any" value={editProduct.mach_Wt || ''} onChange={handleInputChange} />
          </label>

          <label>
            Mach Approval:
            <input name="mach_Appr" value={editProduct.mach_Appr || ''} onChange={handleInputChange} />
          </label>
        </div>

        <div className='popright'>
          <label>
            Assy Part No:
            <input name="assy_PartNo" value={editProduct.assy_PartNo || ''} onChange={handleInputChange} />
          </label>

          <label>
            Assy Drawing Rev:
            <input name="assy_Dwg_Rev" value={editProduct.assy_Dwg_Rev || ''} onChange={handleInputChange} />
          </label>

          <label>
            Assy Part Rev:
            <input name="assy_Part_Rev" value={editProduct.assy_Part_Rev || ''} onChange={handleInputChange} />
          </label>

          <label>
            Assy Weight:
            <input name="assy_Wt" type="number" step="any" value={editProduct.assy_Wt || ''} onChange={handleInputChange} />
          </label>

          <label>
            Assy Approval:
            <input name="assy_Appr" value={editProduct.assy_Appr || ''} onChange={handleInputChange} />
          </label>

          <label>
            Ship Part No:
            <input name="ship_PartNo" value={editProduct.ship_PartNo || ''} onChange={handleInputChange} />
          </label>

          <label>
            HS Part No:
            <input name="hS_PartNo" value={editProduct.hS_PartNo || ''} onChange={handleInputChange} />
          </label>

          <label>
            Project Status:
            <input name="proj_Status" value={editProduct.proj_Status || ''} onChange={handleInputChange} />
          </label>

          <label>
            SOP Date:
            <input name="soP_Date" type="date" value={editProduct.soP_Date || ''} onChange={handleInputChange} />
          </label>

          <label>
            PMP Date:
            <input name="pmpd" type="date" value={editProduct.pmpd || ''} onChange={handleInputChange} />
          </label>

          <label>
            Sale Type:
            <input name="saletype" value={editProduct.saletype || ''} onChange={handleInputChange} />
          </label>

          <label>
            Install Capacity:
            <input name="installCapa" value={editProduct.installCapa || ''} onChange={handleInputChange} />
          </label>

          <label>
            Box Quantity:
            <input name="boxqty" type="number" step="any" value={editProduct.boxqty || ''} onChange={handleInputChange} />
          </label>

          <label>
            Created By:
            <input name="createdBy" value={editProduct.createdBy || ''} onChange={handleInputChange} />
          </label>

          <label>
            Updated By:
            <input name="updatedBy" value={editProduct.updatedBy || ''} onChange={handleInputChange} />
          </label>

          <label>
            Created Date:
            <input name="createdDate" type="date" value={editProduct.createdDate || ''} onChange={handleInputChange} />
          </label>

          <label>
            Updated Date:
            <input name="updatedDate" type="date" value={editProduct.updatedDate || ''} onChange={handleInputChange} />
          </label>
        </div>
      </div>

      <div className='popbuttons'>
        <button type="submit">Save Changes</button>
        <button type="button" onClick={() => setIsEditPopupOpen(false)}>Cancel</button>
      </div>
    </div>
      
      </div>
    
    )}
    </div>
  );
};

export default Page;
