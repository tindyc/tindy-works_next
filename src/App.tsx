import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Studio } from './legacy-pages/Studio';
import { Office } from './legacy-pages/Office';
import { Garden } from './legacy-pages/Garden';
import { Reception } from './legacy-pages/Reception';
import { Contact } from './legacy-pages/Contact';
import { ProjectDetail } from './legacy-pages/ProjectDetail';
import { Cats } from './legacy-pages/Cats';
import { NotFound } from './legacy-pages/NotFound';
import { PlantLab } from './legacy-pages/PlantLab';
import { ThemeProvider } from './context/ThemeContext';
import { ThemeControl } from './components/ThemeControl';
import { ScrollToTop } from './components/ScrollToTop';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<Studio />} />
            <Route path="/office" element={<Office />} />
            <Route path="/garden" element={<Garden />} />
            <Route path="/reception" element={<Reception />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cats" element={<Cats />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/plant-lab" element={<PlantLab />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <ThemeControl />
      </BrowserRouter>
    </ThemeProvider>
  );
}
