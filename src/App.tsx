import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const Edit = lazy(() => import('./routes/Edit'));

function Home() {
  return <div className="p-4 text-gray-700">Dress Tour Sketchbook — Home (T9)</div>;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
      불러오는 중…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/new" element={<Edit />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
