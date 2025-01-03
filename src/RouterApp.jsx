 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Callback from './Callback';

const RouterApp = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/callback" element={<Callback />} />
            </Routes>
        </Router>
    );
};

export default RouterApp;
