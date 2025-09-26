import {
  HashRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import SidebarWithHeader from './components/SidebarWithHeader';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import Noticias from './pages/Noticias';
import Ranking from './pages/Ranking';
import About from './pages/About';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <SidebarWithHeader>
            <Routes>
              <Route path="/" element={<Noticias />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </SidebarWithHeader>
        </HashRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
