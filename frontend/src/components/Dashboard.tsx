import {useState, useEffect, useCallback} from 'react';
import {useAuth} from '../context/AuthContext';
import {useUserData, useMatchData} from '../hooks/useMatchData';
import {useModalState} from '../hooks/useModalState';
import {useAsyncHandler} from '../hooks/useAsyncHandler';
import {
  getTableEndpoint,
  ERROR_MESSAGES,
  API_ENDPOINTS,
} from '../utils/constants';
import {parseErrorMessage} from '../utils/errorHandling';
import {logger} from '../utils/logger';
import {LoadingSpinner} from './LoadingSpinner';
import {Toast} from './Toast';
import {BackButton} from './BackButton';
import {ChangePasswordModal} from './ChangePasswordModal';
import {ChangeEmailModal} from './ChangeEmailModal';
import {ConfirmModal} from './ConfirmModal';
import {TableSelector} from './TableSelector';
import {RowDetailModal} from './RowDetailModal';
import {AddRowsModal} from './AddRowsModal';
import {MatchCard} from './MatchCard';
import UploadMatchResultsModal from './UploadMatchResultsModal';
import {SidebarNavButton} from './SidebarNavButton';
import {UserProfileIcon, DatabaseIcon, PlusIcon} from './Icons';
import {ProfileSection} from './ProfileSection';
import {DatabaseSection} from './DatabaseSection';
import {
  enrichMatches,
  filterFinishedMatchesWithoutResults,
} from '../utils/matchUtils';
import {getMatchResultsEndpoint} from '../utils/constants';

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
  const {authenticatedFetch} = useAuth();
  const {userInfo, error: userError, refetchUserInfo} = useUserData();

  const [activeSection, setActiveSection] = useState<
    'profile' | 'database' | 'uploadMatches'
  >('profile');
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(
    null
  );
  const rowModal = useModalState();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteModal = useModalState();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const addModal = useModalState();
  const {
    execute: executeSubmitWebRows,
    isLoading: isAddingWeb,
    error: webRowsError,
  } = useAsyncHandler(
    async (rows: Record<string, any>[]) => {
      const response = await authenticatedFetch(
        getTableEndpoint(selectedTable),
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(rows),
        }
      );

      if (!response.ok) {
        const errorMessage = await parseErrorMessage(
          response,
          'Error al agregar las filas'
        );
        throw new Error(errorMessage);
      }

      await fetchTableData(selectedTable);
    },
    {modalToClose: addModal, clearErrorAfterMs: 300}
  );

  const {
    execute: executeSubmitJsonRows,
    isLoading: isAddingJson,
    error: jsonRowsError,
  } = useAsyncHandler(
    async (jsonData: any[]) => {
      const response = await authenticatedFetch(
        getTableEndpoint(selectedTable),
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(jsonData),
        }
      );

      if (!response.ok) {
        const errorMessage = await parseErrorMessage(
          response,
          'Error al procesar el JSON'
        );
        throw new Error(errorMessage);
      }

      await fetchTableData(selectedTable);
    },
    {modalToClose: addModal, clearErrorAfterMs: 300}
  );

  const {
    execute: executeSubmitCsvFile,
    isLoading: isAddingCsv,
    error: csvFileError,
  } = useAsyncHandler(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authenticatedFetch(
        getTableEndpoint(selectedTable),
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorMessage = await parseErrorMessage(
          response,
          'Error al procesar el archivo CSV'
        );
        throw new Error(errorMessage);
      }

      await fetchTableData(selectedTable);
    },
    {modalToClose: addModal, clearErrorAfterMs: 300}
  );

  // Combine errors for AddRowsModal
  const modalError = webRowsError || jsonRowsError || csvFileError;
  const isAdding = isAddingWeb || isAddingJson || isAddingCsv;
  const [rowModalError, setRowModalError] = useState<string | null>(null);

  const {
    matches,
    teams,
    players,
    results,
    playerStats,
    error: matchError,
    refetch: refetchMatchData,
  } = useMatchData();

  const enrichedMatches = enrichMatches({
    matches,
    teams,
    players,
    results,
    playerStats,
  });

  const matchesToProcess = filterFinishedMatchesWithoutResults(enrichedMatches);

  const uploadModal = useModalState();
  const [selectedMatchToUpload, setSelectedMatchToUpload] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const openUploadModal = (match: any) => {
    setSelectedMatchToUpload(match);
    setUploadError(null);
    uploadModal.open();
  };

  const handleUploadMatchResults = async (
    resultsFile: File,
    statsFile: File
  ) => {
    if (!selectedMatchToUpload) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('results', resultsFile);
      fd.append('stats', statsFile);

      const resp = await authenticatedFetch(
        getMatchResultsEndpoint(selectedMatchToUpload.id),
        {
          method: 'POST',
          body: fd,
        }
      );

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(
          text || `Error en la subida: ${resp.status} ${resp.statusText}`
        );
      }
      uploadModal.close();
      setSelectedMatchToUpload(null);
      setUploadSuccess('Cargado correctamente');
      if (refetchMatchData) {
        try {
          await refetchMatchData();
        } catch (err) {
          // ignore refetch errors (data will refresh on next visit)
        }
      }
      setTimeout(() => setUploadSuccess(null), 3000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsUploading(false);
    }
  };

  // Password change with useAsyncHandler
  const passwordModal = useModalState();
  const {
    execute: executeChangePassword,
    isLoading: isChangingPassword,
    error: passwordError,
  } = useAsyncHandler(
    async (actualPassword: string, newPassword: string) => {
      const response = await authenticatedFetch(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({actualPassword, newPassword}),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorMessage(
          response,
          'Error al cambiar la contraseña'
        );
        throw new Error(errorMessage);
      }
    },
    {modalToClose: passwordModal, clearErrorAfterMs: 300}
  );

  // Email change with useAsyncHandler
  const emailModal = useModalState();
  const {
    execute: executeChangeEmail,
    isLoading: isChangingEmail,
    error: emailError,
  } = useAsyncHandler(
    async (password: string, newEmail: string) => {
      const response = await authenticatedFetch(API_ENDPOINTS.CHANGE_EMAIL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password, newEmail}),
      });

      if (!response.ok) {
        const errorMessage = await parseErrorMessage(
          response,
          'Error al cambiar el email'
        );
        throw new Error(errorMessage);
      }

      await refetchUserInfo();
    },
    {modalToClose: emailModal, clearErrorAfterMs: 300}
  );

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
      const response = await authenticatedFetch(API_ENDPOINTS.TABLES, {
        method: 'GET',
      });
      if (!response.ok) throw new Error(ERROR_MESSAGES.LOAD_TABLES);
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
      const response = await authenticatedFetch(getTableEndpoint(tableName), {
        method: 'GET',
      });
      if (!response.ok) throw new Error(ERROR_MESSAGES.LOAD_TABLE_DATA);
      const data: TableData = await response.json();
      const sortedData = data.sort((a, b) => {
        if (a.id && b.id) return a.id - b.id;
        return 0;
      });
      setTableData(sortedData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error loading table data';
      setError(errorMessage);
      console.error('Error fetching table data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTableChange = (tableName: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedTable(tableName);
      setSelectedRows(new Set());
      setIsTransitioning(false);
    }, 300);
  };

  // Helper function for section navigation with transition
  const handleSectionChange = useCallback(
    (section: 'profile' | 'database' | 'uploadMatches') => {
      if (activeSection !== section) {
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveSection(section);
          setIsTransitioning(false);
        }, 300);
      }
    },
    [activeSection]
  );

  const handleRowClick = (row: Record<string, any>) => {
    setSelectedRow(row);
    rowModal.open();
    setRowModalError(null);
  };

  const handleCloseModal = () => {
    rowModal.close();
    setTimeout(() => {
      setSelectedRow(null);
      setRowModalError(null);
    }, 300);
  };

  const handleSaveRowChanges = async (editedValues: Record<string, any>) => {
    if (!selectedRow || !selectedRow.id) return;

    setIsSaving(true);
    setRowModalError(null);

    try {
      const response = await authenticatedFetch(
        `${getTableEndpoint(selectedTable)}/${selectedRow.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedValues),
        }
      );

      if (!response.ok) {
        const errorMessage = await parseErrorMessage(
          response,
          'Error al guardar los cambios'
        );
        throw new Error(errorMessage);
      }

      await fetchTableData(selectedTable);
      handleCloseModal();
    } catch (err) {
      setRowModalError(
        err instanceof Error ? err.message : ERROR_MESSAGES.SAVE_CHANGES
      );
      logger.error('Error in handleSaveRowChanges:', err);
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
      const allIds = tableData
        .map(row => row.id)
        .filter(id => id !== undefined);
      setSelectedRows(new Set(allIds));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.size === 0) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const deletePromises = Array.from(selectedRows).map(id =>
        authenticatedFetch(`${getTableEndpoint(selectedTable)}/${id}`, {
          method: 'DELETE',
        })
      );

      const results = await Promise.all(deletePromises);

      const failedDeletions = results.filter(r => !r.ok);
      if (failedDeletions.length > 0) {
        throw new Error(
          `Fallo la eliminación de ${failedDeletions.length} registro${
            failedDeletions.length === 1 ? '' : 's'
          }`
        );
      }

      await fetchTableData(selectedTable);
      setSelectedRows(new Set());

      deleteModal.close();
      setTimeout(() => {
        setDeleteError(null);
      }, 300);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : ERROR_MESSAGES.DELETE_RECORDS
      );
      logger.error('Error in handleDeleteSelected:', err);
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
        <div className="mb-8">
          <BackButton />
        </div>

        {/* Main Dashboard Container */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-black/50">
          <div className="flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar */}
            <div className="w-full md:w-64 md:shrink-0 bg-white/5 border-b md:border-b-0 md:border-r border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Dashboard</h2>

              <div className="space-y-2">
                <SidebarNavButton
                  label="Mi información"
                  icon={<UserProfileIcon />}
                  isActive={activeSection === 'profile'}
                  onClick={() => handleSectionChange('profile')}
                />
              </div>

              {userInfo?.admin && (
                <>
                  <div className="my-6 border-t border-white/10"></div>
                  <div className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Administrador
                  </div>
                  <div className="space-y-2">
                    <SidebarNavButton
                      label="Cargar resultados"
                      icon={<PlusIcon />}
                      isActive={activeSection === 'uploadMatches'}
                      onClick={() => handleSectionChange('uploadMatches')}
                    />
                    <SidebarNavButton
                      label="Base de datos"
                      icon={<DatabaseIcon />}
                      isActive={activeSection === 'database'}
                      onClick={() => handleSectionChange('database')}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
              <div
                className={`transition-opacity duration-300 ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {activeSection === 'profile' && (
                  <ProfileSection
                    userInfo={userInfo}
                    userError={userError}
                    onChangePassword={passwordModal.open}
                    onChangeEmail={emailModal.open}
                  />
                )}

                {activeSection === 'uploadMatches' && userInfo?.admin && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-white">
                        Cargar resultados
                      </h3>
                      <div className="text-slate-400 text-sm">
                        Subir resultados y estadísticas
                      </div>
                    </div>

                    {/* upload success is shown via Toast */}

                    <div>
                      {matchesToProcess.length === 0 ? (
                        <div className="text-slate-400">
                          No hay partidos pendientes para procesar.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {matchesToProcess.map(m => (
                            <MatchCard
                              key={m.id}
                              match={m}
                              onMatchClick={() => openUploadModal(m)}
                              onBetClick={() => {}}
                              customAction={{
                                text: 'Cargar resultados',
                                onClick: () => openUploadModal(m),
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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
                    onTableChange={handleTableChange}
                    onRowClick={handleRowClick}
                    selectedRows={selectedRows}
                    onToggleRowSelection={toggleRowSelection}
                    onToggleSelectAll={toggleSelectAll}
                    onDeleteSelected={() => {
                      setDeleteError(null);
                      deleteModal.open();
                    }}
                    onShowAddModal={addModal.open}
                    isDeleting={isDeleting}
                    isTransitioning={isTransitioning}
                    ongoingMatches={matchesToProcess}
                    onOpenUploadMatch={openUploadModal}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        isClosing={deleteModal.isClosing}
        onClose={() => {
          deleteModal.close();
          setTimeout(() => {
            setDeleteError(null);
          }, 300);
        }}
        onConfirm={handleDeleteSelected}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que querés fletar ${selectedRows.size} ${
          selectedRows.size === 1 ? 'registro' : 'registros'
        }? <b>Esta acción no se puede deshacer.</b>`}
        confirmText="Sí, eliminar"
        isLoading={isDeleting}
        variant="danger"
        error={deleteError}
      />

      <AddRowsModal
        isOpen={addModal.isOpen}
        isClosing={addModal.isClosing}
        selectedTable={selectedTable}
        selectedTableInfo={selectedTableInfo}
        onClose={addModal.close}
        onSubmitWeb={executeSubmitWebRows}
        onSubmitJson={executeSubmitJsonRows}
        onSubmitCsv={executeSubmitCsvFile}
        isLoading={isAdding}
        error={modalError}
      />

      <ChangePasswordModal
        isOpen={passwordModal.isOpen}
        isClosing={passwordModal.isClosing}
        onClose={passwordModal.close}
        onSubmit={executeChangePassword}
        isLoading={isChangingPassword}
        error={passwordError}
      />

      <ChangeEmailModal
        isOpen={emailModal.isOpen}
        isClosing={emailModal.isClosing}
        onClose={emailModal.close}
        onSubmit={executeChangeEmail}
        isLoading={isChangingEmail}
        error={emailError}
      />

      <UploadMatchResultsModal
        isOpen={uploadModal.isOpen}
        isClosing={uploadModal.isClosing}
        match={
          selectedMatchToUpload
            ? {
                id: selectedMatchToUpload.id,
                match_date: selectedMatchToUpload.match_date,
                team_a_name: selectedMatchToUpload.team_a?.name,
                team_b_name: selectedMatchToUpload.team_b?.name,
                team_a_image: selectedMatchToUpload.team_a?.image_url,
                team_b_image: selectedMatchToUpload.team_b?.image_url,
              }
            : null
        }
        onClose={() => {
          uploadModal.close();
          setTimeout(() => setUploadError(null), 300);
        }}
        onSubmit={handleUploadMatchResults}
        isLoading={isUploading}
        error={uploadError}
      />

      <RowDetailModal
        isOpen={rowModal.isOpen}
        isClosing={rowModal.isClosing}
        selectedRow={selectedRow}
        selectedTable={selectedTable}
        onClose={handleCloseModal}
        onSave={handleSaveRowChanges}
        isSaving={isSaving}
        error={rowModalError}
      />
      {uploadSuccess && (
        <Toast
          message={uploadSuccess}
          type="success"
          onClose={() => setUploadSuccess(null)}
          duration={2500}
        />
      )}
    </div>
  );
}

export default Dashboard;
