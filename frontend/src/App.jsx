import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Results from './pages/Results';
import Recommended from './pages/Recommended';
import FindSimilar from './pages/Find-Similar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
        <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find-similar" element={<FindSimilar />} />
            <Route path="/results" element={<Results />} />
            <Route path="/recommended" element={<Recommended />} />
          </Routes>
        <Footer />
    </Router>
  );
}

export default App;