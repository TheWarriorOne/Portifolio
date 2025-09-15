import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

function Upload() {
  const [file, setFile] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="p-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-400 p-6 rounded-lg text-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Solte o arquivo aqui...</p>
        ) : (
          <p className="text-gray-500">
            Arraste e solte uma imagem (JPEG/PNG) ou clique para selecionar
          </p>
        )}
      </div>
      {file && (
        <div className="mt-4">
          <p>Arquivo selecionado: {file.name}</p>
          <img src={URL.createObjectURL(file)} alt="Preview" className="mt-2 max-w-xs" />
        </div>
      )}
    </div>
  );
}

export default Upload;
