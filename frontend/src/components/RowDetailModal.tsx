import {useState} from 'react';
import {ModalOverlay, ModalHeader} from './ModalOverlay';
import {Button} from './Button';

type RowDetailModalProps = {
  isOpen: boolean;
  isClosing: boolean;
  selectedRow: Record<string, any> | null;
  selectedTable: string;
  onClose: () => void;
  onSave: (editedValues: Record<string, any>) => Promise<void>;
  isSaving: boolean;
  error?: string | null;
};

export function RowDetailModal({
  isOpen,
  isClosing,
  selectedRow,
  selectedTable,
  onClose,
  onSave,
  isSaving,
  error,
}: RowDetailModalProps) {
  const [editableFields, setEditableFields] = useState<Set<string>>(new Set());
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  const handleClose = () => {
    setEditableFields(new Set());
    setEditedValues({});
    onClose();
  };

  const toggleFieldEditable = (fieldName: string) => {
    setEditableFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldName)) {
        newSet.delete(fieldName);
        // Remove from edited values when disabling edit
        setEditedValues(prevEdited => {
          const newEdited = {...prevEdited};
          delete newEdited[fieldName];
          return newEdited;
        });
      } else {
        newSet.add(fieldName);
        // Initialize with current value
        if (selectedRow) {
          setEditedValues(prevEdited => ({
            ...prevEdited,
            [fieldName]: selectedRow[fieldName],
          }));
        }
      }
      return newSet;
    });
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setEditedValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const hasRealChanges = () => {
    if (!selectedRow || Object.keys(editedValues).length === 0) return false;

    return Object.entries(editedValues).some(([key, value]) => {
      return selectedRow[key] !== value;
    });
  };

  const handleSave = async () => {
    if (!hasRealChanges()) return;

    await onSave(editedValues);
    setEditableFields(new Set());
    setEditedValues({});
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      isClosing={isClosing}
      onClose={handleClose}
      maxWidth="2xl"
    >
      <div className="max-h-[70vh] flex flex-col">
        <ModalHeader
          title="Detalles del registro"
          subtitle={`Tabla: ${selectedTable}`}
          onClose={handleClose}
        />

        {/* Modal Content */}
        <div className="overflow-y-auto pr-2 flex-1 min-h-0">
          <div className="space-y-3">
            {selectedRow && Object.entries(selectedRow).map(([key, value]) => {
              const isEditable = editableFields.has(key);
              const currentValue =
                isEditable && editedValues.hasOwnProperty(key)
                  ? editedValues[key]
                  : value;
              const isIdField = key === 'id';

              return (
                <div
                  key={key}
                  className="bg-slate-900/50 border border-white/20 rounded-lg p-4 hover:bg-slate-900/70 transition-all duration-200"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <label className="block text-sm text-slate-300 font-semibold wrap-break-word">
                        {key}
                      </label>
                      {!isIdField && (
                        <button
                          onClick={() => toggleFieldEditable(key)}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 active:scale-95 ${
                            isEditable
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-500/30'
                              : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:bg-slate-700'
                          }`}
                        >
                          {isEditable ? (
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                              Deshacer
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                              Editar
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="w-full min-w-0">
                      {isEditable ? (
                        typeof value === 'boolean' ? (
                          <select
                            value={String(currentValue)}
                            onChange={e =>
                              handleFieldChange(key, e.target.value === 'true')
                            }
                            className="w-full px-3 py-2 bg-slate-800 text-white border border-blue-400/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                          >
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : typeof value === 'number' ? (
                          <input
                            type="number"
                            value={currentValue}
                            onChange={e =>
                              handleFieldChange(key, parseFloat(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-slate-800 text-white border border-blue-400/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                          />
                        ) : typeof value === 'string' &&
                          (key.toLowerCase().includes('date') ||
                            key.toLowerCase().includes('_at') ||
                            key.toLowerCase().includes('timestamp')) ? (
                          <input
                            type="datetime-local"
                            value={
                              currentValue
                                ? new Date(currentValue)
                                    .toISOString()
                                    .slice(0, 16)
                                : ''
                            }
                            onChange={e =>
                              handleFieldChange(
                                key,
                                e.target.value
                                  ? new Date(e.target.value).toISOString()
                                  : ''
                              )
                            }
                            className="w-full px-3 py-2 bg-slate-800 text-white border border-blue-400/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                          />
                        ) : (
                          <input
                            type="text"
                            value={currentValue || ''}
                            onChange={e =>
                              handleFieldChange(key, e.target.value)
                            }
                            className="w-full px-3 py-2 bg-slate-800 text-white border border-blue-400/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                          />
                        )
                      ) : value === null ? (
                        <span className="text-slate-500 italic text-sm">
                          null
                        </span>
                      ) : typeof value === 'boolean' ? (
                        <span
                          className={`font-semibold ${
                            value ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {value.toString()}
                        </span>
                      ) : typeof value === 'object' ? (
                        <pre className="text-purple-300 font-mono text-xs bg-black/30 p-3 rounded border border-white/10 overflow-x-auto whitespace-pre-wrap wrap-break-word">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : typeof value === 'string' &&
                        (value.startsWith('http://') ||
                          value.startsWith('https://')) ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline break-all transition-colors duration-200 text-sm block"
                        >
                          {String(value)}
                        </a>
                      ) : (
                        <span className="text-white wrap-break-word text-sm block">
                          {String(value)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg shrink-0">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        {editableFields.size > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10 shrink-0">
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasRealChanges()}
              isLoading={isSaving}
              variant="gradient"
              className="w-full"
            >
              Guardar cambios
            </Button>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}
