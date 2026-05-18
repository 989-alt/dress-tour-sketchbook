import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useAppStore } from './store/appStore';

const Home = lazy(() => import('./routes/Home'));
const Edit = lazy(() => import('./routes/Edit'));
const Summary = lazy(() => import('./routes/Summary'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
      불러오는 중…
    </div>
  );
}

export default function App() {
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    useAppStore.getState().hydrate();
  }, []);

  if (!hydrated) {
    return <LoadingFallback />;
  }

  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <BrowserRouter basename={basename}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/edit/:id" element={<Edit />} />
          <Route path="/new" element={<Edit />} />
          <Route path="/summary" element={<Summary />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
