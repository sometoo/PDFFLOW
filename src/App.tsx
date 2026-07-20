import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import EditorialPolicy from './pages/EditorialPolicy';
import NotFound from './pages/NotFound';
import BlogList from './pages/blog/BlogList';
import BlogPost from './pages/blog/BlogPost';
import MergePdf from './pages/tools/MergePdf';
import SplitPdf from './pages/tools/SplitPdf';
import ExtractPages from './pages/tools/ExtractPages';
import DeletePages from './pages/tools/DeletePages';
import RotatePdf from './pages/tools/RotatePdf';
import JpgToPdf from './pages/tools/JpgToPdf';
import PdfToJpg from './pages/tools/PdfToJpg';

export function AppRoutes() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans antialiased">
        {/* Navigation Bar */}
        <Header />
        
        {/* Main Contents Router */}
        <main className="flex-grow">
          <Routes>
            {/* Korean Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/pdf-merge" element={<MergePdf />} />
            <Route path="/pdf-split" element={<SplitPdf />} />
            <Route path="/pdf-extract-pages" element={<ExtractPages />} />
            <Route path="/pdf-delete-pages" element={<DeletePages />} />
            <Route path="/pdf-rotate" element={<RotatePdf />} />
            <Route path="/jpg-to-pdf" element={<JpgToPdf />} />
            <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/editorial-policy" element={<EditorialPolicy />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            {/* English Routes */}
            <Route path="/en" element={<Home />} />
            <Route path="/en/pdf-merge" element={<MergePdf />} />
            <Route path="/en/pdf-split" element={<SplitPdf />} />
            <Route path="/en/pdf-extract-pages" element={<ExtractPages />} />
            <Route path="/en/pdf-delete-pages" element={<DeletePages />} />
            <Route path="/en/pdf-rotate" element={<RotatePdf />} />
            <Route path="/en/jpg-to-pdf" element={<JpgToPdf />} />
            <Route path="/en/pdf-to-jpg" element={<PdfToJpg />} />
            <Route path="/en/about" element={<About />} />
            <Route path="/en/privacy" element={<Privacy />} />
            <Route path="/en/terms" element={<Terms />} />
            <Route path="/en/contact" element={<Contact />} />
            <Route path="/en/editorial-policy" element={<EditorialPolicy />} />
            <Route path="/en/blog" element={<BlogList />} />
            <Route path="/en/blog/:slug" element={<BlogPost />} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Footer Links */}
        <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
