import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App'
import Dashboard from './components/Dashboard'

export default function AppRoutes(){
    return (
        <Router>
            <Routes>
                <Route path='/' element={<App />} />
                <Route path='/dashboard' element={<Dashboard userId={'demo_user'} />} />
            </Routes>
        </Router>
    )
}
