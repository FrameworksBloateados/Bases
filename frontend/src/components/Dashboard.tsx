import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router';
import {useAuth} from '../context/AuthContext';
import {useUserData} from '../hooks/useMatchData';
import {LoadingSpinner} from './LoadingSpinner';
import {BackButton} from './BackButton';

type TableInfo = {
  name: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    default: string | null;
  }[];
};

type TableData = Record<string, any>[];

export function Dashboard() {
  const navigate = useNavigate();
  const {authenticatedFetch, logout} = useAuth();
  const {userInfo, error: userError, refetchUserInfo} = useUserData();

  const [activeSection, setActiveSection] = useState<'profile' | 'database'>(
    'profile'
  );
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(
    null
  );
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [editableFields, setEditableFields] = useState<Set<string>>(new Set());
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleteModalClosing, setIsDeleteModalClosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextSection, setNextSection] = useState<'profile' | 'database' | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddModalClosing, setIsAddModalClosing] = useState(false);
  const [addMode, setAddMode] = useState<'web' | 'csv' | 'json'>('web');
  const [newRows, setNewRows] = useState<Record<string, any>[]>([{}]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (
      activeSection === 'database' &&
      userInfo?.admin &&
      tables.length === 0
    ) {
      fetchTables();
    }
  }, [activeSection, userInfo]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    setLoadingTables(true);
    setError(null);
    try {
      const response = await authenticatedFetch(
        'http://127-0-0-1.sslip.io/api/v1/tables',
        {
          method: 'GET',
        }
      );
      if (!response.ok) throw new Error('Failed to fetch tables');
      const data: TableInfo[] = await response.json();
      setTables(data);
      if (data.length > 0 && data[0]) {
        setSelectedTable(data[0].name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading tables');
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchTableData = async (tableName: string) => {
    setLoadingData(true);
    setError(null);
    try {
      const response = await authenticatedFetch(
        `http://127-0-0-1.sslip.io/api/v1/${tableName}/json`,
        {method: 'GET'}
      );
      if (!response.ok)
        throw new Error(`Failed to fetch data for ${tableName}`);
      const data: TableData = await response.json();
      // Sort by id if the id field exists
      const sortedData = data.sort((a, b) => {
        if (a.id !== undefined && b.id !== undefined) {
          return a.id - b.id;
        }
        return 0;
      });
      setTableData(sortedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading table data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleTableChange = (tableName: string) => {
    if (tableName === selectedTable) {
      setShowDropdown(false);
      return;
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedTable(tableName);
      setShowDropdown(false);
      setSelectedRows(new Set());
      setIsTransitioning(false);
    }, 300);
  };

  const toggleDropdown = () => {
    if (showDropdown) {
      setIsClosing(true);
      setTimeout(() => {
        setShowDropdown(false);
        setIsClosing(false);
      }, 200);
    } else {
      setShowDropdown(true);
    }
  };

  const handleRowClick = (row: Record<string, any>) => {
    setSelectedRow(row);
    setIsModalClosing(false);
    setEditableFields(new Set());
    setEditedValues({});
  };

  const handleCloseModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setSelectedRow(null);
      setIsModalClosing(false);
      setEditableFields(new Set());
      setEditedValues({});
    }, 300);
  };

  const toggleFieldEditable = (fieldName: string) => {
    setEditableFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldName)) {
        newSet.delete(fieldName);
        // Remove from edited values when undoing
        setEditedValues(prevValues => {
          const {[fieldName]: _, ...rest} = prevValues;
          return rest;
        });
      } else {
        newSet.add(fieldName);
        // Initialize edited value with current value when enabling edit
        if (!editedValues.hasOwnProperty(fieldName) && selectedRow) {
          setEditedValues(prev => ({
            ...prev,
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
    
    // Check if any edited value is different from the original
    return Object.entries(editedValues).some(([key, value]) => {
      return selectedRow[key] !== value;
    });
  };

  const handleSaveChanges = async () => {
    if (
      !selectedRow ||
      !selectedRow.id ||
      Object.keys(editedValues).length === 0
    ) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await authenticatedFetch(
        `http://127-0-0-1.sslip.io/api/v1/${selectedTable}/${selectedRow.id}/json`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedValues),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar los cambios');
      }

      // Refresh table data and close modal
      await fetchTableData(selectedTable);
      handleCloseModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar los cambios'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRowSelection = (id: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === tableData.length) {
      setSelectedRows(new Set());
    } else {
      const allIds = tableData.map(row => row.id).filter(id => id !== undefined);
      setSelectedRows(new Set(allIds));
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalClosing(true);
    setTimeout(() => {
      setShowAddModal(false);
      setIsAddModalClosing(false);
      setAddMode('web');
      setNewRows([{}]);
      setCsvFile(null);
      setJsonInput('');
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

  const handleSubmitWeb = async () => {
    setIsAdding(true);
    setError(null);

    try {
      // Filter out empty string values from each row
      const cleanedRows = newRows.map(row => {
        const cleanedRow: Record<string, any> = {};
        Object.entries(row).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            cleanedRow[key] = value;
          }
        });
        return cleanedRow;
      });

      const response = await authenticatedFetch(
        `http://127-0-0-1.sslip.io/api/v1/${selectedTable}/json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedRows),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al agregar las filas');
      }

      await fetchTableData(selectedTable);
      handleCloseAddModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar las filas');
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitCsv = async () => {
    if (!csvFile) {
      setError('Por favor selecciona un archivo CSV');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await authenticatedFetch(
        `http://127-0-0-1.sslip.io/api/v1/${selectedTable}/csv`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al procesar el archivo CSV');
      }

      await fetchTableData(selectedTable);
      handleCloseAddModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo CSV');
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitJson = async () => {
    if (!jsonInput.trim()) {
      setError('Por favor ingresa un JSON válido');
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      // Parse and validate JSON
      let parsedJson;
      try {
        parsedJson = JSON.parse(jsonInput);
      } catch (parseError) {
        throw new Error('El JSON ingresado no es válido. Verifica la sintaxis.');
      }

      // Ensure it's an array
      const dataArray = Array.isArray(parsedJson) ? parsedJson : [parsedJson];

      // Filter out empty string values from each object
      const cleanedData = dataArray.map(item => {
        const cleanedItem: Record<string, any> = {};
        Object.entries(item).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            cleanedItem[key] = value;
          }
        });
        return cleanedItem;
      });

      const response = await authenticatedFetch(
        `http://127-0-0-1.sslip.io/api/v1/${selectedTable}/json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cleanedData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al insertar los datos');
      }

      await fetchTableData(selectedTable);
      handleCloseAddModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el JSON');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.size === 0) return;

    setIsDeleteModalClosing(true);
    setTimeout(() => {
      setShowDeleteConfirm(false);
      setIsDeleteModalClosing(false);
    }, 300);

    setIsDeleting(true);
    setError(null);

    try {
      // Delete each selected row
      const deletePromises = Array.from(selectedRows).map(id =>
        authenticatedFetch(
          `http://127-0-0-1.sslip.io/api/v1/${selectedTable}/${id}`,
          {method: 'DELETE'}
        )
      );

      const results = await Promise.all(deletePromises);
      
      // Check if all deletions were successful
      const failedDeletions = results.filter(r => !r.ok);
      if (failedDeletions.length > 0) {
        throw new Error(`Failed to delete ${failedDeletions.length} record(s)`);
      }

      // Refresh table data and clear selection
      await fetchTableData(selectedTable);
      setSelectedRows(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar los registros');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedTableInfo = tables.find(t => t.name === selectedTable);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient py-8 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute top-40 left-10 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{animationDelay: '2s'}}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{animationDelay: '4s'}}
        ></div>
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header with Back Button */}
        <div className="mb-8">
          <BackButton />
        </div>

        {/* Main Dashboard Container */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-black/50">
          <div className="flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full md:w-64 md:shrink-0 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Dashboard</h2>

              {/* User Options */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    if (activeSection !== 'profile') {
                      setIsTransitioning(true);
                      setNextSection('profile');
                      setTimeout(() => {
                        setActiveSection('profile');
                        setIsTransitioning(false);
                        setNextSection(null);
                      }, 300);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 focus:outline-none select-none border ${
                    activeSection === 'profile'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                      : 'text-slate-300 hover:bg-white/5 active:bg-white/10 border-transparent'
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Mi información
                </button>
              </div>

              {/* Admin Options */}
              {userInfo?.admin && (
                <>
                  <div className="my-6 border-t border-white/10"></div>
                  <div className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Administrador
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (activeSection !== 'database') {
                          setIsTransitioning(true);
                          setNextSection('database');
                          setTimeout(() => {
                            setActiveSection('database');
                            setIsTransitioning(false);
                            setNextSection(null);
                          }, 300);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 focus:outline-none select-none border ${
                        activeSection === 'database'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                          : 'text-slate-300 hover:bg-white/5 active:bg-white/10 border-transparent'
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                        />
                      </svg>
                      Base de datos
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
              <div className={`transition-opacity duration-300 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}>
                {activeSection === 'profile' && (
                  <ProfileSection userInfo={userInfo} userError={userError} />
                )}

                {activeSection === 'database' && userInfo?.admin && (
                  <DatabaseSection
                  tables={tables}
                  selectedTable={selectedTable}
                  selectedTableInfo={selectedTableInfo}
                  tableData={tableData}
                  loadingTables={loadingTables}
                  loadingData={loadingData}
                  error={error}
                  showDropdown={showDropdown}
                  isClosing={isClosing}
                  onTableChange={handleTableChange}
                  onToggleDropdown={toggleDropdown}
                  onRowClick={handleRowClick}
                  selectedRows={selectedRows}
                  onToggleRowSelection={toggleRowSelection}
                  onToggleSelectAll={toggleSelectAll}
                  onDeleteSelected={() => setShowDeleteConfirm(true)}
                  onShowAddModal={() => setShowAddModal(true)}
                  isDeleting={isDeleting}
                  isTransitioning={isTransitioning}
                />
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-200 ${
            isDeleteModalClosing ? 'animate-fade-out' : 'animate-fade-in'
          }`}
          onClick={() => {
            setIsDeleteModalClosing(true);
            setTimeout(() => {
              setShowDeleteConfirm(false);
              setIsDeleteModalClosing(false);
            }, 300);
          }}
        >
          <div
            className={`bg-slate-800 border border-white/20 rounded-2xl p-8 max-w-md w-full ${
              isDeleteModalClosing ? 'animate-scale-out' : 'animate-scale-in'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Confirmar eliminación
                </h3>
                <p className="text-slate-300 text-sm">
                  ¿Estás seguro de que deseas eliminar {selectedRows.size} {selectedRows.size === 1 ? 'registro' : 'registros'}? 
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalClosing(true);
                  setTimeout(() => {
                    setShowDeleteConfirm(false);
                    setIsDeleteModalClosing(false);
                  }, 300);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className={`px-4 py-2 text-sm font-bold rounded-lg shadow-lg transition-colors duration-300 ${
                  isDeleting
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl active:scale-99'
                }`}
              >
                {isDeleting ? (
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
                    Eliminando...
                  </span>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Rows Modal */}
      {showAddModal && (
        <div
          className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-200 ${
            isAddModalClosing ? 'animate-fade-out' : 'animate-fade-in'
          }`}
          onClick={handleCloseAddModal}
        >
          <div
            className={`bg-slate-800 border border-white/20 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] flex flex-col ${
              isAddModalClosing ? 'animate-scale-out' : 'animate-scale-in'
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
                onClick={handleCloseAddModal}
                className="text-slate-400 hover:text-white text-2xl transition-colors duration-200"
              >
                ×
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
              <button
                onClick={() => setAddMode('web')}
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
                onClick={() => setAddMode('json')}
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
                onClick={() => setAddMode('csv')}
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
            <div className="overflow-y-auto pr-2 flex-1 min-h-0">
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
                        {selectedTableInfo?.columns.map(col => (
                          <div key={col.name}>
                            <label className="block text-sm text-slate-300 font-semibold mb-1">
                              {col.name}
                              {!col.nullable && <span className="text-red-400 ml-1">*</span>}
                            </label>
                            <input
                              type="text"
                              value={row[col.name] || ''}
                              onChange={(e) => handleRowFieldChange(rowIndex, col.name, e.target.value)}
                              placeholder={col.default ? `Default: ${col.default}` : ''}
                              className="w-full px-3 py-2 bg-slate-800 text-white border border-slate-600/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                            />
                          </div>
                        ))}
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
                      Pega tu JSON acá:
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
                      <strong>Formato esperado:</strong> Un objeto JSON o un array de objetos. Los campos vacíos serán omitidos automáticamente.
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
                        {csvFile ? csvFile.name : 'Haz clic para seleccionar un archivo CSV'}
                      </span>
                      <span className="text-slate-500 text-sm">
                        o arrastra y suelta aquí
                      </span>
                    </label>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                      <strong>Formato esperado:</strong> El archivo CSV debe tener una fila de encabezados con los nombres de las columnas, seguida de las filas de datos.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-white/10 shrink-0 flex gap-3 justify-end">
              <button
                onClick={handleCloseAddModal}
                disabled={isAdding}
                className="px-4 py-2 text-sm font-bold text-white bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99"
              >
                Cancelar
              </button>
              <button
                onClick={addMode === 'web' ? handleSubmitWeb : addMode === 'json' ? handleSubmitJson : handleSubmitCsv}
                disabled={isAdding || (addMode === 'csv' && !csvFile) || (addMode === 'json' && !jsonInput.trim())}
                className={`px-4 py-2 text-sm font-bold rounded-lg shadow-lg transition-all duration-300 ${
                  isAdding || (addMode === 'csv' && !csvFile) || (addMode === 'json' && !jsonInput.trim())
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                    : 'text-white bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl active:scale-99'
                }`}
              >
                {isAdding ? (
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
                  'Añadir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row Detail Modal */}
      {selectedRow && (
        <div
          className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-200 ${
            isModalClosing ? 'animate-fade-out' : 'animate-fade-in'
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`bg-slate-800 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] flex flex-col ${
              isModalClosing ? 'animate-scale-out' : 'animate-scale-in'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Detalles del registro
                </h2>
                <p className="text-slate-400 text-sm">
                  Tabla:{' '}
                  <span className="font-semibold text-blue-400">
                    {selectedTable}
                  </span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white text-2xl transition-colors duration-200"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto pr-2 flex-1 min-h-0">
              <div className="space-y-3">
                {Object.entries(selectedRow).map(([key, value]) => {
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
                                  handleFieldChange(
                                    key,
                                    e.target.value === 'true'
                                  )
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
                                  handleFieldChange(
                                    key,
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-full px-3 py-2 bg-slate-800 text-white border border-blue-400/50 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
                              />
                            ) : typeof value === 'string' && (key.toLowerCase().includes('date') || key.toLowerCase().includes('_at') || key.toLowerCase().includes('timestamp')) ? (
                              <input
                                type="datetime-local"
                                value={currentValue ? new Date(currentValue).toISOString().slice(0, 16) : ''}
                                onChange={e =>
                                  handleFieldChange(key, e.target.value ? new Date(e.target.value).toISOString() : '')
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

            {/* Save Button */}
            {editableFields.size > 0 && (
              <div className="mt-6 pt-4 border-t border-white/10 shrink-0">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving || !hasRealChanges()}
                  className={`w-full px-4 py-2 text-sm font-bold rounded-lg shadow-lg transition-all duration-300 whitespace-nowrap ${
                    isSaving || !hasRealChanges()
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50 scale-95'
                      : 'text-white bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 hover:shadow-xl active:scale-99 opacity-100 scale-100'
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 shrink-0"
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
                      Guardando...
                    </span>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type ProfileSectionProps = {
  userInfo: any;
  userError: string | null;
};

function ProfileSection({userInfo, userError}: ProfileSectionProps) {
  if (userError) {
    return (
      <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        Error: {userError}
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="text-slate-400 animate-pulse">
        Cargando información del usuario...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Mi Información</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
          label="Usuario"
          value={userInfo.username}
          color="blue"
        />

        <InfoCard
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
          label="Email"
          value={userInfo.email}
          color="purple"
        />

        <InfoCard
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          label="Balance"
          value={`$${userInfo.balance}`}
          color="green"
        />

        <InfoCard
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
          label="Rol"
          value={userInfo.admin ? 'Administrador' : 'Usuario'}
          color={userInfo.admin ? 'yellow' : 'slate'}
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-400 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1 text-sm">
            <p className="text-slate-300">
              <span className="font-semibold">ID de cuenta:</span> {userInfo.id}
            </p>
            <p className="text-slate-400 mt-1">
              <span className="font-semibold">Creada:</span>{' '}
              {new Date(userInfo.created_at).toLocaleString('es-ES')}
            </p>
            <p className="text-slate-400">
              <span className="font-semibold">Última actualización:</span>{' '}
              {new Date(userInfo.updated_at).toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'green' | 'yellow' | 'slate';
};

function InfoCard({icon, label, value, color}: InfoCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-400/30 text-blue-300',
    purple:
      'from-purple-500/20 to-purple-600/20 border-purple-400/30 text-purple-300',
    green:
      'from-green-500/20 to-green-600/20 border-green-400/30 text-green-300',
    yellow:
      'from-yellow-500/20 to-yellow-600/20 border-yellow-400/30 text-yellow-300',
    slate:
      'from-slate-500/20 to-slate-600/20 border-slate-400/30 text-slate-300',
  };

  return (
    <div
      className={`bg-linear-to-br ${colorClasses[color]} border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <div className={`${colorClasses[color]}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-white font-semibold truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

type DatabaseSectionProps = {
  tables: TableInfo[];
  selectedTable: string;
  selectedTableInfo: TableInfo | undefined;
  tableData: TableData;
  loadingTables: boolean;
  loadingData: boolean;
  error: string | null;
  showDropdown: boolean;
  isClosing: boolean;
  onTableChange: (tableName: string) => void;
  onToggleDropdown: () => void;
  onRowClick: (row: Record<string, any>) => void;
  selectedRows: Set<number>;
  onToggleRowSelection: (id: number) => void;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
  onShowAddModal: () => void;
  isDeleting: boolean;
  isTransitioning: boolean;
};

function DatabaseSection({
  tables,
  selectedTable,
  selectedTableInfo,
  tableData,
  loadingTables,
  loadingData,
  error,
  showDropdown,
  isClosing,
  onTableChange,
  onToggleDropdown,
  onRowClick,
  selectedRows,
  onToggleRowSelection,
  onToggleSelectAll,
  onDeleteSelected,
  onShowAddModal,
  isDeleting,
  isTransitioning,
}: DatabaseSectionProps) {
  if (loadingTables) {
    return (
      <LoadingSpinner text="Cargando tablas..." className="animate-pulse" />
    );
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-opacity duration-300 ${
      isTransitioning ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Base de datos</h3>

        <div className="flex items-center gap-3">
          {/* Delete Button */}
          <button
            onClick={selectedRows.size > 0 ? onDeleteSelected : undefined}
            disabled={isDeleting || selectedRows.size === 0}
            className={`px-4 py-2 text-sm font-bold rounded-lg shadow-lg transition-all duration-300 whitespace-nowrap ${
              isDeleting
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                : selectedRows.size > 0
                ? 'text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl active:scale-99 opacity-100 scale-100'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-40 scale-95'
            }`}
          >
            {isDeleting ? (
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
                Eliminando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {selectedRows.size > 0 ? `Eliminar (${selectedRows.size})` : 'Eliminar'}
              </span>
            )}
          </button>

          {/* Insert Button */}
          <button
            onClick={onShowAddModal}
            className="px-4 py-2 text-sm font-bold rounded-lg shadow-lg transition-all duration-300 whitespace-nowrap text-white bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl active:scale-99"
          >
            <span className="flex items-center gap-2">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Insertar
            </span>
          </button>

          {/* Table Dropdown Selector */}
          <div className="relative z-50">
            <button
              onClick={onToggleDropdown}
              className="px-4 py-2 text-sm font-bold text-white bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 flex items-center gap-2 min-w-[200px] justify-between"
            >
            <span className="truncate">
              {selectedTable || 'Seleccionar tabla'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                showDropdown && !isClosing ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showDropdown && (
            <div
              className={`absolute right-0 mt-2 w-64 bg-slate-800 border border-white/20 rounded-lg shadow-2xl overflow-hidden backdrop-blur-lg ${
                isClosing ? 'animate-slideUp' : 'animate-slideDown'
              }`}
            >
              <div className="max-h-80 overflow-y-auto">
                {tables.map(table => (
                  <button
                    key={table.name}
                    onClick={() => onTableChange(table.name)}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                      selectedTable === table.name
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {table.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Table Schema */}
      {selectedTableInfo && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 transition-all duration-300 hover:bg-white/[0.07]">
          <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
            Estructura de la tabla
          </h4>
          <div className="space-y-2">
            {selectedTableInfo.columns.map(col => (
              <div key={col.name} className="flex items-center gap-3 text-sm">
                <span className="font-mono text-blue-300">{col.name}</span>
                <span className="text-slate-500">:</span>
                <span className="text-purple-300">{col.type}</span>
                {!col.nullable && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                    NOT NULL
                  </span>
                )}
                {col.default && (
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                    DEFAULT
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Data */}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden transition-all duration-300 hover:bg-white/[0.07]">
        <div className="p-4 border-b border-white/10">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Datos ({tableData.length}{' '}
            {tableData.length === 1 ? 'registro' : 'registros'})
          </h4>
        </div>

        {loadingData ? (
          <div className="p-8 text-center">
            <LoadingSpinner
              text="Cargando datos..."
              className="animate-pulse justify-center"
            />
          </div>
        ) : tableData.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No hay datos en esta tabla
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === tableData.length && tableData.length > 0}
                      onChange={onToggleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                  </th>
                  {tableData[0] &&
                    Object.keys(tableData[0]).map(key => (
                      <th
                        key={key}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-white/10 transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          onToggleRowSelection(row.id);
                        }}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                      />
                    </td>
                    {Object.entries(row).map(([key, value], cellIdx) => (
                      <td 
                        key={cellIdx} 
                        className="px-4 py-3 text-slate-300 cursor-pointer"
                        onClick={() => onRowClick(row)}
                      >
                        {value === null ? (
                          <span className="text-slate-500 italic">null</span>
                        ) : typeof value === 'boolean' ? (
                          <span
                            className={
                              value ? 'text-green-400' : 'text-red-400'
                            }
                          >
                            {value.toString()}
                          </span>
                        ) : typeof value === 'object' ? (
                          <span className="text-purple-300 font-mono text-xs">
                            {JSON.stringify(value)}
                          </span>
                        ) : typeof value === 'string' &&
                          (value.startsWith('http://') ||
                            value.startsWith('https://')) ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline truncate max-w-xs inline-block transition-colors duration-200"
                          >
                            {String(value)}
                          </a>
                        ) : (
                          <span className="truncate max-w-xs inline-block">
                            {String(value)}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
