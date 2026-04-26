"use client";

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Studio } from '../legacy-pages/Studio';
import { Garden } from '../legacy-pages/Garden';
import { Contact } from '../legacy-pages/Contact';
import { ProjectDetail } from '../legacy-pages/ProjectDetail';
import { Cats } from '../legacy-pages/Cats';
import { NotFound } from '../legacy-pages/NotFound';
import { PlantLab } from '../legacy-pages/PlantLab';
import { ScrollToTop } from '../components/ScrollToTop';

export default function LegacyApp() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Studio />} />
          <Route path="/garden" element={<Garden />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cats" element={<Cats />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/plant-lab" element={<PlantLab />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
