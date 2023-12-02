import {React, useState} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import DrawingPage from './DrawingPage';
import ConstellationPage from './ConstellationPage';
import GalleryPage from './GalleryPage';

function App() {
  const [indicesGlobal, setIndicesGlobal] = useState([])
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/drawing" element={<DrawingPage indicesGlobal={indicesGlobal} setIndicesGlobal={setIndicesGlobal}/>} />
          <Route path="/constellation" element={<ConstellationPage indicesGlobal={indicesGlobal}/>} />
          <Route path="/gallery" element={<GalleryPage indicesGlobal={indicesGlobal} setIndicesGlobal={setIndicesGlobal}/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
