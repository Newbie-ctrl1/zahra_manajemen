'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
  acceptedFormats: string[];
  title: string;
  description: string;
  templateData?: any[];
  templateFilename?: string;
}

export default function FileUpload({
  onFileUpload,
  acceptedFormats,
  title,
  description,
  templateData,
  templateFilename = 'template.xlsx',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (!acceptedFormats.includes(`.${extension}`)) {
        throw new Error(`Format file tidak didukung. Gunakan: ${acceptedFormats.join(', ')}`);
      }

      setUploadedFile(file);

      // Parse file based on type
      let parsedData: any[] = [];

      if (extension === 'xlsx' || extension === 'xls') {
        parsedData = await parseExcel(file);
      } else if (extension === 'csv') {
        parsedData = await parseCSV(file);
      } else if (extension === 'pdf') {
        throw new Error('PDF parsing belum didukung. Gunakan Excel atau CSV.');
      }

      if (parsedData.length === 0) {
        throw new Error('File tidak mengandung data yang valid');
      }

      onFileUpload(parsedData);
      setUploadStatus('success');
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Gagal memproses file');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseExcel = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const XLSX = await import('xlsx');
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsBinaryString(file);
    });
  };

  const parseCSV = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('CSV tidak mengandung data'));
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim());
          const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Gagal membaca file CSV'));
      reader.readAsText(file);
    });
  };

  const handleDownloadTemplate = async () => {
    if (!templateData || templateData.length === 0) return;

    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      XLSX.writeFile(wb, templateFilename);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        {templateData && (
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Template
          </button>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {uploadedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              {uploadStatus === 'success' ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <FileText className="w-12 h-12 text-blue-600" />
              )}
            </div>
            
            <div>
              <p className="font-medium text-gray-900">{uploadedFile.name}</p>
              <p className="text-sm text-gray-600">
                {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>

            {uploadStatus === 'success' && (
              <p className="text-green-600 font-medium">✓ File berhasil diproses!</p>
            )}

            {uploadStatus === 'error' && (
              <div className="text-red-600">
                <p className="font-medium">✗ Gagal memproses file</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            <button
              onClick={handleRemoveFile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Hapus File
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <Upload className={`w-12 h-12 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragging ? 'Lepaskan file di sini' : 'Drag & drop file atau'}
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept={acceptedFormats.join(',')}
              className="hidden"
              id="file-upload"
            />
            
            <label
              htmlFor="file-upload"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Pilih File
            </label>
            
            <p className="text-sm text-gray-500 mt-4">
              Format yang didukung: {acceptedFormats.join(', ')}
            </p>
          </>
        )}

        {isProcessing && (
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Memproses file...</p>
          </div>
        )}
      </div>
    </div>
  );
}
