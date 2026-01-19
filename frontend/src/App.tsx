import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import LoginPage from './auth/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import ScannerRecordingPage from './roles/packager/pages/ScannerRecordingPage';
import AdminDashboard from './roles/admin/pages/AdminDashboard';

function App() {
  return (
    <div className="dark">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard/>} />
          </Route>

          {/* Packager Routes */}
          <Route element={<ProtectedRoute allowedRoles={['packager', 'admin']} />}>
            <Route path="/packager/scan" element={<ScannerRecordingPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </div>
  );
}

export default App;
