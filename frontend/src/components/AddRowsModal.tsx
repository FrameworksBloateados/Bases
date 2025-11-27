import {useState, type ReactElement} from 'react';
import {ModalOverlay} from './ModalOverlay';
import {Button} from './Button';
import { ErrorDisplay } from './ErrorDisplay';

type TableColumn = {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
};

type TableInfo = {
  name: string;
  columns: TableColumn[];
};

type AddMode = 'web' | 'csv' | 'json';

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
  const [addMode, setAddMode] = useState<AddMode>('web');
  const [newRows, setNewRows] = useState<Record<string, any>[]>([{}]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [isModeTransitioning, setIsModeTransitioning] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClose = () => {
    setAddMode('web');
    setNewRows([{}]);
    setCsvFile(null);
    setJsonInput('');
    setIsModeTransitioning(false);
    setLocalError(null);
    onClose();
  };

  const handleModeChange = (mode: AddMode) => {
    setIsModeTransitioning(true);
    setTimeout(() => {
      setAddMode(mode);
      setIsModeTransitioning(false);
      setLocalError(null);
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
    updated[index] = {...updated[index], [field]: value};
    setNewRows(updated);
  };

  const cleanRowData = (row: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      if (value !== '' && value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    }
    return cleaned;
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
    const cleanedRows = newRows.map(cleanRowData);
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
    const cleanedData = dataArray.map(cleanRowData);

    await onSubmitJson(cleanedData);
  };

  const handleSubmitCsv = async () => {
    if (!csvFile) return;
    await onSubmitCsv(csvFile);
  };

  const handleSubmit = async () => {
    setLocalError(null);
    try {
      if (addMode === 'web') {
        await handleSubmitWeb();
      } else if (addMode === 'json') {
        await handleSubmitJson();
      } else {
        await handleSubmitCsv();
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Error desconocido');
    }
  };

  const isSubmitDisabled = () => {
    if (isLoading) return true;
    if (addMode === 'csv') return !csvFile;
    if (addMode === 'json') return !jsonInput.trim();
    if (addMode === 'web') return !areRequiredFieldsFilled();
    return false;
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      isClosing={isClosing}
      onClose={handleClose}
      maxWidth="2xl"
    >
      <div className="max-h-[80vh] flex flex-col">
        <ModalHeader selectedTable={selectedTable} onClose={handleClose} />
        <ModeTabs addMode={addMode} onModeChange={handleModeChange} />
        <ModalContent
          addMode={addMode}
          isModeTransitioning={isModeTransitioning}
          newRows={newRows}
          selectedTableInfo={selectedTableInfo}
          jsonInput={jsonInput}
          csvFile={csvFile}
          error={localError || error}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
          onRowFieldChange={handleRowFieldChange}
          onJsonInputChange={setJsonInput}
          onCsvFileChange={setCsvFile}
        />
        <ActionButtons
          isLoading={isLoading}
          isSubmitDisabled={isSubmitDisabled()}
          onCancel={handleClose}
          onSubmit={handleSubmit}
        />
      </div>
    </ModalOverlay>
  );
}

type ModalHeaderProps = {
  selectedTable: string;
  onClose: () => void;
};

function ModalHeader({selectedTable, onClose}: ModalHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-6 shrink-0">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Insertar</h2>
        <p className="text-slate-400 text-sm">
          Tabla:{' '}
          <span className="font-semibold text-blue-400">{selectedTable}</span>
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-white text-2xl transition-colors duration-200"
      >
        ×
      </button>
    </div>
  );
}

type ModeTabsProps = {
  addMode: AddMode;
  onModeChange: (mode: AddMode) => void;
};

type ModeTabConfig = {
  mode: AddMode;
  icon: ReactElement;
  label: string;
};

function ModeTabs({addMode, onModeChange}: ModeTabsProps) {
  const tabs: ModeTabConfig[] = [
    {
      mode: 'web',
      label: 'Web',
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      mode: 'json',
      label: 'JSON',
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
    {
      mode: 'csv',
      label: 'CSV',
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
      {tabs.map(({mode, icon, label}) => (
        <ModeTab
          key={mode}
          mode={mode}
          icon={icon}
          label={label}
          isActive={addMode === mode}
          onClick={() => onModeChange(mode)}
        />
      ))}
    </div>
  );
}

type ModeTabProps = {
  mode: AddMode;
  icon: ReactElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function ModeTab({icon, label, isActive, onClick}: ModeTabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
        isActive
          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-lg'
          : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700 hover:border-slate-500/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

type ModalContentProps = {
  addMode: AddMode;
  isModeTransitioning: boolean;
  newRows: Record<string, any>[];
  selectedTableInfo: TableInfo | undefined;
  jsonInput: string;
  csvFile: File | null;
  error: string | null;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onRowFieldChange: (index: number, field: string, value: any) => void;
  onJsonInputChange: (value: string) => void;
  onCsvFileChange: (file: File | null) => void;
};

function ModalContent({
  addMode,
  isModeTransitioning,
  newRows,
  selectedTableInfo,
  jsonInput,
  csvFile,
  error,
  onAddRow,
  onRemoveRow,
  onRowFieldChange,
  onJsonInputChange,
  onCsvFileChange,
}: ModalContentProps) {
  return (
    <div>
      <div
        className={`overflow-y-auto pr-2 flex-1 min-h-0 transition-opacity duration-300 ${
          isModeTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {addMode === 'web' && (
          <WebModeContent
            newRows={newRows}
            selectedTableInfo={selectedTableInfo}
            onAddRow={onAddRow}
            onRemoveRow={onRemoveRow}
            onRowFieldChange={onRowFieldChange}
          />
        )}

        {addMode === 'json' && (
          <JsonModeContent
            jsonInput={jsonInput}
            selectedTableInfo={selectedTableInfo}
            onJsonInputChange={onJsonInputChange}
          />
        )}

        {addMode === 'csv' && (
          <CsvModeContent csvFile={csvFile} onCsvFileChange={onCsvFileChange} />
        )}
      </div>
      {error && <ErrorDisplay message={error} className="mt-4 mb-2" />}
    </div>
  );
}

type WebModeContentProps = {
  newRows: Record<string, any>[];
  selectedTableInfo: TableInfo | undefined;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onRowFieldChange: (index: number, field: string, value: any) => void;
};

function WebModeContent({
  newRows,
  selectedTableInfo,
  onAddRow,
  onRemoveRow,
  onRowFieldChange,
}: WebModeContentProps) {
  return (
    <div className="space-y-4">
      {newRows.map((row, rowIndex) => (
        <RowEditor
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          selectedTableInfo={selectedTableInfo}
          canRemove={newRows.length > 1}
          onRemove={() => onRemoveRow(rowIndex)}
          onFieldChange={(field, value) =>
            onRowFieldChange(rowIndex, field, value)
          }
        />
      ))}
      <button
        onClick={onAddRow}
        className="w-full px-4 py-2 text-sm font-bold text-blue-300 bg-blue-500/10 border border-blue-400/30 rounded-lg hover:bg-blue-500/20 transition-all duration-200"
      >
        + Agregar otra fila
      </button>
    </div>
  );
}

type RowEditorProps = {
  row: Record<string, any>;
  rowIndex: number;
  selectedTableInfo: TableInfo | undefined;
  canRemove: boolean;
  onRemove: () => void;
  onFieldChange: (field: string, value: any) => void;
};

function RowEditor({
  row,
  rowIndex,
  selectedTableInfo,
  canRemove,
  onRemove,
  onFieldChange,
}: RowEditorProps) {
  return (
    <div className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-semibold">Fila {rowIndex + 1}</h3>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {selectedTableInfo?.columns.map(col => (
          <FieldInput
            key={col.name}
            column={col}
            value={row[col.name]}
            onChange={value => onFieldChange(col.name, value)}
          />
        ))}
      </div>
    </div>
  );
}

type FieldInputProps = {
  column: TableColumn;
  value: any;
  onChange: (value: any) => void;
};

function FieldInput({column, value, onChange}: FieldInputProps) {
  const isRequired =
    !column.nullable && !column.default && column.name !== 'id';
  const isTimestamp =
    column.type.toLowerCase().includes('timestamp') ||
    column.name.toLowerCase().includes('_at') ||
    column.name.toLowerCase().includes('date');
  const isNumber =
    column.type.toLowerCase().includes('int') ||
    column.type.toLowerCase().includes('float') ||
    column.type.toLowerCase().includes('decimal') ||
    column.type.toLowerCase().includes('numeric');
  const isBoolean = column.type.toLowerCase().includes('bool');

  const baseInputClasses =
    'w-full px-3 py-2 bg-slate-800 text-white border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200';

  return (
    <div>
      <label className="block text-sm text-slate-300 font-semibold mb-1">
        {column.name}
        {isRequired && <span className="text-red-400 ml-1">*</span>}
      </label>

      {isBoolean ? (
        <select
          value={value !== undefined ? String(value) : ''}
          onChange={e => onChange(e.target.value === 'true')}
          className={baseInputClasses}
        >
          <option value="">Seleccionar...</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : isTimestamp ? (
        <input
          type="datetime-local"
          value={value ? new Date(value).toISOString().slice(0, 16) : ''}
          onChange={e =>
            onChange(
              e.target.value ? new Date(e.target.value).toISOString() : ''
            )
          }
          className={baseInputClasses}
        />
      ) : isNumber ? (
        <input
          type="number"
          step="any"
          value={value !== undefined ? value : ''}
          onChange={e =>
            onChange(e.target.value ? parseFloat(e.target.value) : '')
          }
          placeholder={column.default ? `Default: ${column.default}` : ''}
          className={baseInputClasses}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={column.default ? `Default: ${column.default}` : ''}
          className={baseInputClasses}
        />
      )}
    </div>
  );
}

type JsonModeContentProps = {
  jsonInput: string;
  selectedTableInfo: TableInfo | undefined;
  onJsonInputChange: (value: string) => void;
};

function JsonModeContent({
  jsonInput,
  selectedTableInfo,
  onJsonInputChange,
}: JsonModeContentProps) {
  const generatePlaceholder = () => {
    if (!selectedTableInfo) return `[{"campo1": "valor1"}]`;

    const exampleObj = Object.fromEntries(
      selectedTableInfo.columns
        .filter(col => col.name !== 'id')
        .slice(0, 3)
        .map(col => [
          col.name,
          col.type.includes('varchar')
            ? 'ejemplo'
            : col.type.includes('int')
            ? 1
            : col.type.includes('bool')
            ? true
            : 'valor',
        ])
    );

    return `[${JSON.stringify(exampleObj, null, 2)}]`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
        <label className="block text-sm text-slate-300 font-semibold mb-2">
          Pegá tu JSON acá:
        </label>
        <textarea
          value={jsonInput}
          onChange={e => onJsonInputChange(e.target.value)}
          placeholder={generatePlaceholder()}
          className="w-full h-64 px-3 py-2 bg-slate-800 text-white placeholder:text-slate-600 border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 font-mono text-sm resize-none"
        />
      </div>
      <InfoBox message="<strong>Formato esperado:</strong> un objeto JSON o un array de objetos. Los campos vacíos serán omitidos automáticamente." />
    </div>
  );
}

type CsvModeContentProps = {
  csvFile: File | null;
  onCsvFileChange: (file: File | null) => void;
};

function CsvModeContent({csvFile, onCsvFileChange}: CsvModeContentProps) {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
        <input
          type="file"
          accept=".csv"
          onChange={e => onCsvFileChange(e.target.files?.[0] || null)}
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
            {csvFile
              ? csvFile.name
              : 'Hacé clic acá para seleccionar un archivo CSV'}
          </span>
          <span className="text-slate-500 text-sm">
            o arrastra y soltá el archivo acá
          </span>
        </label>
      </div>
      <InfoBox message="<strong>Formato esperado:</strong> el archivo CSV debe tener una fila de encabezados con los nombres de las columnas, seguida de las filas de datos." />
    </div>
  );
}

function InfoBox({message}: {message: string}) {
  return (
    <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
      <p
        className="text-blue-300 text-sm"
        dangerouslySetInnerHTML={{__html: message}}
      />
    </div>
  );
}



type ActionButtonsProps = {
  isLoading: boolean;
  isSubmitDisabled: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

function ActionButtons({
  isLoading,
  isSubmitDisabled,
  onSubmit,
}: ActionButtonsProps) {
  return (
    <div className="mt-6 pt-4 border-t border-white/10 shrink-0 flex gap-3 justify-end">
      <Button
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        isLoading={isLoading}
        variant="gradient"
        className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
      >
        Insertar
      </Button>
    </div>
  );
}
