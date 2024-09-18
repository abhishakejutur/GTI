"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '../components/Nav';

export default function Home() {
  const [empId, setEmpId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [storedEmpId, setStoredEmpId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const empIdFromStorage = localStorage.getItem('emp_id');
      setStoredEmpId(empIdFromStorage);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!empId) {
      setLoginError('Employee ID is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emp_id: empId }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('emp_id', empId);
        setIsLoggedIn(true);
        await fetch('http://localhost:3000/api/generate-schema', {
          method: 'POST',
        });
        router.push('/foundary_weekly_plan');
      } else {
        setLoginError(data.error);
      }
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div>
      <Nav emp_id={storedEmpId} /> 
      <div className="login">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Login</h1>
          </div><br />
          <div className="card-content">
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="emp_id" className="label">Employee ID</label>
                <input
                  id="emp_id"
                  className="input"
                  placeholder="Enter your employee ID"
                  type="text"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                />
              </div>
              <button className="button" type="submit">Login</button>
            </form>
            {loginError && <p className="login-error">{loginError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
