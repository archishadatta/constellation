import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import DrawingPage from './DrawingPage';
import ConstellationPage from './ConstellationPage';
import GalleryPage from './GalleryPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/drawing" element={<DrawingPage />} />
          <Route path="/constellation" element={<ConstellationPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
