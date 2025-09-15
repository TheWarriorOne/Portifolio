import UploadImage from './components/UploadImage';
import Gallery from './components/Gallery';

function App() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Portifolio – Gerenciador de Imagens</h1>
      <UploadImage />
      <Gallery />
    </main>
  );
}

export default App;
