import { useState } from 'react';

type TableInfo = {
  name: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    default: string | null;
  }[];
};

type AddRowsModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  selectedTable: string;
  selectedTableInfo: TableInfo | undefined;
  onClose: () => void;
  onSubmitWeb: (rows: Record<string, any>[]) => Promise<void>;
  onSubmitJson: (jsonData: any[]) => Promise<void>;
  onSubmitCsv: (file: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export function AddRowsModal({
  isOpen,
  isClosing,
  selectedTable,
  selectedTableInfo,
  onClose,
  onSubmitWeb,
  onSubmitJson,
  onSubmitCsv,
  isLoading,
  error,
}: AddRowsModalProps) {
  const [addMode, setAddMode] = useState<'web' | 'csv' | 'json'>('web');
  const [newRows, setNewRows] = useState<Record<string, any>[]>([{}]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [isModeTransitioning, setIsModeTransitioning] = useState(false);

  const handleClose = () => {
    setAddMode('web');
    setNewRows([{}]);
    setCsvFile(null);
    setJsonInput('');
    setIsModeTransitioning(false);
    onClose();
  };

  const handleModeChange = (mode: 'web' | 'csv' | 'json') => {
    if (mode === addMode) return;
    
    setIsModeTransitioning(true);
    setTimeout(() => {
      setAddMode(mode);
      setIsModeTransitioning(false);
    }, 300);
  };

  const handleAddRow = () => {
    setNewRows([...newRows, {}]);
  };

  const handleRemoveRow = (index: number) => {
    if (newRows.length > 1) {
      setNewRows(newRows.filter((_, i) => i !== index));
    }
  };

  const handleRowFieldChange = (index: number, field: string, value: any) => {
    const updated = [...newRows];
    updated[index] = { ...updated[index], [field]: value };
    setNewRows(updated);
  };

  const areRequiredFieldsFilled = () => {
    if (!selectedTableInfo) return false;
    
    const requiredFields = selectedTableInfo.columns.filter(
      col => !col.nullable && !col.default && col.name !== 'id'
    );

    return newRows.every(row => {
      return requiredFields.every(field => {
        const value = row[field.name];
        return value !== undefined && value !== '' && value !== null;
      });
    });
  };

  const handleSubmitWeb = async () => {
    const cleanedRows = newRows.map(row => {
      const cleaned: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) {
        if (value !== '' && value !== undefined && value !== null) {
          cleaned[key] = value;
        }
      }
      return cleaned;
    });

    await onSubmitWeb(cleanedRows);
  };

  const handleSubmitJson = async () => {
    if (!jsonInput.trim()) return;

    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonInput);
    } catch (parseError) {
      throw new Error('JSON inválido');
    }

    const dataArray = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
    const cleanedData = dataArray.map(item => {
      const cleaned: Record<string, any> = {};
      for (const [key, value] of Object.entries(item)) {
        if (value !== '' && value !== undefined && value !== null) {
          cleaned[key] = value;
        }
      }
      return cleaned;
    });

    await onSubmitJson(cleanedData);
  };

  const handleSubmitCsv = async () => {
    if (!csvFile) return;
    await onSubmitCsv(csvFile);
  };

  const handleSubmit = async () => {
    if (addMode === 'web') {
      await handleSubmitWeb();
    } else if (addMode === 'json') {
      await handleSubmitJson();
    } else {
      await handleSubmitCsv();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-200 ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-slate-800 border border-white/20 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] flex flex-col ${
          isClosing ? 'animate-scale-out' : 'animate-scale-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Insertar
            </h2>
            <p className="text-slate-400 text-sm">
              Tabla: <span className="font-semibold text-blue-400">{selectedTable}</span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white text-2xl transition-colors duration-200"
          >
            ×
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
          <button
            onClick={() => handleModeChange('web')}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              addMode === 'web'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-lg'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700 hover:border-slate-500/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Web
          </button>
          <button
            onClick={() => handleModeChange('json')}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              addMode === 'json'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-lg'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700 hover:border-slate-500/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            JSON
          </button>
          <button
            onClick={() => handleModeChange('csv')}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              addMode === 'csv'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-lg'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700 hover:border-slate-500/50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            CSV
          </button>
        </div>

        {/* Modal Content */}
        <div className={`overflow-y-auto pr-2 flex-1 min-h-0 transition-opacity duration-300 ${
          isModeTransitioning ? 'opacity-0' : 'opacity-100'
        }`}>
          {addMode === 'web' ? (
            <div className="space-y-4">
              {newRows.map((row, rowIndex) => (
                <div key={rowIndex} className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white font-semibold">Fila {rowIndex + 1}</h3>
                    {newRows.length > 1 && (
                      <button
                        onClick={() => handleRemoveRow(rowIndex)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTableInfo?.columns.map(col => {
                      const isRequired = !col.nullable && !col.default && col.name !== 'id';
                      const isTimestamp = col.type.toLowerCase().includes('timestamp') || 
                                        col.name.toLowerCase().includes('_at') || 
                                        col.name.toLowerCase().includes('date');
                      const isNumber = col.type.toLowerCase().includes('int') || 
                                     col.type.toLowerCase().includes('float') || 
                                     col.type.toLowerCase().includes('decimal') || 
                                     col.type.toLowerCase().includes('numeric');
                      const isBoolean = col.type.toLowerCase().includes('bool');
                      
                      return (
                        <div key={col.name}>
                          <label className="block text-sm text-slate-300 font-semibold mb-1">
                            {col.name}
                            {isRequired && <span className="text-red-400 ml-1">*</span>}
                          </label>
                          {isBoolean ? (
                            <select
                              value={row[col.name] !== undefined ? String(row[col.name]) : ''}
                              onChange={(e) => handleRowFieldChange(rowIndex, col.name, e.target.value === 'true')}
                              className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                            >
                              <option value="">Seleccionar...</option>
                              <option value="true">true</option>
                              <option value="false">false</option>
                            </select>
                          ) : isTimestamp ? (
                            <input
                              type="datetime-local"
                              value={row[col.name] ? new Date(row[col.name]).toISOString().slice(0, 16) : ''}
                              onChange={(e) => handleRowFieldChange(rowIndex, col.name, e.target.value ? new Date(e.target.value).toISOString() : '')}
                              className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                            />
                          ) : isNumber ? (
                            <input
                              type="number"
                              step="any"
                              value={row[col.name] !== undefined ? row[col.name] : ''}
                              onChange={(e) => handleRowFieldChange(rowIndex, col.name, e.target.value ? parseFloat(e.target.value) : '')}
                              placeholder={col.default ? `Default: ${col.default}` : ''}
                              className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                            />
                          ) : (
                            <input
                              type="text"
                              value={row[col.name] || ''}
                              onChange={(e) => handleRowFieldChange(rowIndex, col.name, e.target.value)}
                              placeholder={col.default ? `Default: ${col.default}` : ''}
                              className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddRow}
                className="w-full px-4 py-2 text-sm font-bold text-blue-300 bg-blue-500/10 border border-blue-400/30 rounded-lg hover:bg-blue-500/20 transition-all duration-200"
              >
                + Agregar otra fila
              </button>
            </div>
          ) : addMode === 'json' ? (
            <div className="space-y-4">
              <div className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
                <label className="block text-sm text-slate-300 font-semibold mb-2">
                  Pegá tu JSON acá:
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={selectedTableInfo ? `[${JSON.stringify(
                    Object.fromEntries(
                      selectedTableInfo.columns
                        .filter(col => col.name !== 'id')
                        .slice(0, 3)
                        .map(col => [col.name, col.type.includes('varchar') ? 'ejemplo' : col.type.includes('int') ? 1 : col.type.includes('bool') ? true : 'valor'])
                    ),
                    null,
                    2
                  )}]` : `[{"campo1": "valor1"}]`}
                  className="w-full h-64 px-3 py-2 bg-slate-800 text-white placeholder:text-slate-600 border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 font-mono text-sm resize-none"
                />
              </div>
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Formato esperado:</strong> un objeto JSON o un array de objetos. Los campos vacíos serán omitidos automáticamente.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
                >
                  <svg
                    className="w-12 h-12 text-slate-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-slate-300 font-semibold mb-1">
                    {csvFile ? csvFile.name : 'Hacé clic acá para seleccionar un archivo CSV'}
                  </span>
                  <span className="text-slate-500 text-sm">
                    o arrastra y soltá el archivo acá
                  </span>
                </label>
              </div>
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Formato esperado:</strong> el archivo CSV debe tener una fila de encabezados con los nombres de las columnas, seguida de las filas de datos.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 whitespace-pre-wrap wrap-break-word">
                  {error}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-white/10 shrink-0 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-bold text-white bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (addMode === 'csv' && !csvFile) || (addMode === 'json' && !jsonInput.trim()) || (addMode === 'web' && !areRequiredFieldsFilled())}
            className={`px-4 py-2 text-sm font-bold rounded-lg shadow-lg transition-all duration-300 ${
              isLoading || (addMode === 'csv' && !csvFile) || (addMode === 'json' && !jsonInput.trim()) || (addMode === 'web' && !areRequiredFieldsFilled())
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                : 'text-white bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl active:scale-99'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Agregando...
              </span>
            ) : (
              'Insertar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
