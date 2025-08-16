
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BlocksPage from './pages/BlocksPage';

const App: React.FC = () => (
    <Router>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/blocks" element={<BlocksPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </Router>
);

export default App;