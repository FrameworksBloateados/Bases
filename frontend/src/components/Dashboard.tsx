import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router';
import {useAuth} from '../context/AuthContext';
import {useUserData} from '../hooks/useMatchData';
import {LoadingSpinner} from './LoadingSpinner';
import {BackButton} from './BackButton';
import {ChangePasswordModal} from './ChangePasswordModal';
import {ChangeEmailModal} from './ChangeEmailModal';
import {ConfirmModal} from './ConfirmModal';
import {TableSelector} from './TableSelector';
import {RowDetailModal} from './RowDetailModal';
import {AddRowsModal} from './AddRowsModal';

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
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(
    null
  );
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleteModalClosing, setIsDeleteModalClosing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddModalClosing, setIsAddModalClosing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Password change states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isChangePasswordModalClosing, setIsChangePasswordModalClosing] =
    useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Email change states
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [isChangeEmailModalClosing, setIsChangeEmailModalClosing] =
    useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

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
      if (!response.ok) throw new Error('Error al cargar las tablas');
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
        throw new Error('Error al cargar los datos de la tabla');
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

  const handleRowClick = (row: Record<string, any>) => {
    setSelectedRow(row);
    setIsModalClosing(false);
  };

  const handleCloseModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setSelectedRow(null);
      setIsModalClosing(false);
    }, 300);
  };

  const handleSaveRowChanges = async (editedValues: Record<string, any>) => {
    if (!selectedRow || !selectedRow.id) return;

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
        let errorMessage = 'Error al guardar los cambios';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      await fetchTableData(selectedTable);
      handleCloseModal();
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Error desconocido al guardar los cambios';
      setError(errorMsg);
      console.error('Error in handleSaveRowChanges:', err);
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

    setIsDeleteModalClosing(true);
    setTimeout(() => {
      setShowDeleteConfirm(false);
      setIsDeleteModalClosing(false);
    }, 300);

    setIsDeleting(true);
    setError(null);

    try {
      const deletePromises = Array.from(selectedRows).map(id =>
        authenticatedFetch(
          `http://127-0-0-1.sslip.io/api/v1/${selectedTable}/${id}`,
          {method: 'DELETE'}
        )
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
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Error desconocido al eliminar los registros';
      setError(errorMsg);
      console.error('Error in handleDeleteSelected:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = async (
    actualPassword: string,
    newPassword: string
  ) => {
    setIsChangingPassword(true);
    setPasswordError(null);

    try {
      const response = await authenticatedFetch(
        'http://127-0-0-1.sslip.io/api/v1/user/changePassword',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({actualPassword, newPassword}),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Error al cambiar la contraseña';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      setIsChangePasswordModalClosing(true);
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setIsChangePasswordModalClosing(false);
        setPasswordError(null);
      }, 300);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Error desconocido al cambiar la contraseña';
      setPasswordError(errorMsg);
      console.error('Error in handleChangePassword:', err);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async (password: string, newEmail: string) => {
    setIsChangingEmail(true);
    setEmailError(null);

    try {
      const response = await authenticatedFetch(
        'http://127-0-0-1.sslip.io/api/v1/user/changeEmail',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({password, newEmail}),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Error al cambiar el email';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      await refetchUserInfo();
      setIsChangeEmailModalClosing(true);
      setTimeout(() => {
        setShowChangeEmailModal(false);
        setIsChangeEmailModalClosing(false);
        setEmailError(null);
      }, 300);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Error desconocido al cambiar el email';
      setEmailError(errorMsg);
      console.error('Error in handleChangeEmail:', err);
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleSubmitWebRows = async (rows: Record<string, any>[]) => {
    setIsAdding(true);
    setModalError(null);

    try {
      const response = await authenticatedFetch(
        `http://127-0-0-1.sslip.io/api/v1/${selectedTable}/json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rows),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Error al agregar las filas';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      await fetchTableData(selectedTable);
      setIsAddModalClosing(true);
      setTimeout(() => {
        setShowAddModal(false);
        setIsAddModalClosing(false);
        setModalError(null);
      }, 300);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Error desconocido al agregar las filas';
      setModalError(errorMsg);
      console.error('Error in handleSubmitWebRows:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitJsonRows = async (jsonData: any[]) => {
    setIsAdding(true);
    setModalError(null);

    try {
      const response = await authenticatedFetch(
        `http://127-0-0-1.sslip.io/api/v1/${selectedTable}/json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Error al procesar el JSON';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      await fetchTableData(selectedTable);
      setIsAddModalClosing(true);
      setTimeout(() => {
        setShowAddModal(false);
        setIsAddModalClosing(false);
        setModalError(null);
      }, 300);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Error desconocido al procesar el JSON';
      setModalError(errorMsg);
      console.error('Error in handleSubmitJsonRows:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitCsvFile = async (file: File) => {
    setIsAdding(true);
    setModalError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await authenticatedFetch(
        `http://127-0-0-1.sslip.io/api/v1/${selectedTable}/csv`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMessage = 'Error al procesar el archivo CSV';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      await fetchTableData(selectedTable);
      setIsAddModalClosing(true);
      setTimeout(() => {
        setShowAddModal(false);
        setIsAddModalClosing(false);
        setModalError(null);
      }, 300);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Error desconocido al procesar el archivo CSV';
      setModalError(errorMsg);
      console.error('Error in handleSubmitCsvFile:', err);
    } finally {
      setIsAdding(false);
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
                <button
                  onClick={() => {
                    if (activeSection !== 'profile') {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setActiveSection('profile');
                        setIsTransitioning(false);
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
                          setTimeout(() => {
                            setActiveSection('database');
                            setIsTransitioning(false);
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
              <div
                className={`transition-opacity duration-300 ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {activeSection === 'profile' && (
                  <ProfileSection
                    userInfo={userInfo}
                    userError={userError}
                    onChangePassword={() => setShowChangePasswordModal(true)}
                    onChangeEmail={() => setShowChangeEmailModal(true)}
                  />
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

      {/* Modals */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        isClosing={isDeleteModalClosing}
        onClose={() => {
          setIsDeleteModalClosing(true);
          setTimeout(() => {
            setShowDeleteConfirm(false);
            setIsDeleteModalClosing(false);
          }, 300);
        }}
        onConfirm={handleDeleteSelected}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que querés fletar ${selectedRows.size} ${
          selectedRows.size === 1 ? 'registro' : 'registros'
        }? <b>Esta acción no se puede deshacer.</b>`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />

      <AddRowsModal
        isOpen={showAddModal}
        isClosing={isAddModalClosing}
        selectedTable={selectedTable}
        selectedTableInfo={selectedTableInfo}
        onClose={() => {
          setIsAddModalClosing(true);
          setTimeout(() => {
            setShowAddModal(false);
            setIsAddModalClosing(false);
            setModalError(null);
          }, 300);
        }}
        onSubmitWeb={handleSubmitWebRows}
        onSubmitJson={handleSubmitJsonRows}
        onSubmitCsv={handleSubmitCsvFile}
        isLoading={isAdding}
        error={modalError}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        isClosing={isChangePasswordModalClosing}
        onClose={() => {
          setIsChangePasswordModalClosing(true);
          setTimeout(() => {
            setShowChangePasswordModal(false);
            setIsChangePasswordModalClosing(false);
            setPasswordError(null);
          }, 300);
        }}
        onSubmit={handleChangePassword}
        isLoading={isChangingPassword}
        error={passwordError}
      />

      <ChangeEmailModal
        isOpen={showChangeEmailModal}
        isClosing={isChangeEmailModalClosing}
        onClose={() => {
          setIsChangeEmailModalClosing(true);
          setTimeout(() => {
            setShowChangeEmailModal(false);
            setIsChangeEmailModalClosing(false);
            setEmailError(null);
          }, 300);
        }}
        onSubmit={handleChangeEmail}
        isLoading={isChangingEmail}
        error={emailError}
      />

      <RowDetailModal
        isOpen={!!selectedRow}
        isClosing={isModalClosing}
        selectedRow={selectedRow}
        selectedTable={selectedTable}
        onClose={handleCloseModal}
        onSave={handleSaveRowChanges}
        isSaving={isSaving}
      />
    </div>
  );
}

type ProfileSectionProps = {
  userInfo: any;
  userError: string | null;
  onChangePassword: () => void;
  onChangeEmail: () => void;
};

function ProfileSection({
  userInfo,
  userError,
  onChangePassword,
  onChangeEmail,
}: ProfileSectionProps) {
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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <button
          onClick={onChangePassword}
          className="flex items-center justify-center gap-3 text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg p-4 shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 group"
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
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          <span className="font-semibold">Cambiar contraseña</span>
        </button>

        <button
          onClick={onChangeEmail}
          className="flex items-center justify-center gap-3 text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-lg p-4 shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 group"
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="font-semibold">Cambiar email</span>
        </button>
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
  onTableChange: (tableName: string) => void;
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
  onTableChange,
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
    <div
      className={`space-y-6 transition-opacity duration-300 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
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
                {selectedRows.size > 0
                  ? `Eliminar (${selectedRows.size})`
                  : 'Eliminar'}
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

          {/* Table Selector */}
          <TableSelector
            tables={tables}
            selectedTable={selectedTable}
            onTableChange={onTableChange}
          />
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
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.size === tableData.length &&
                        tableData.length > 0
                      }
                      onChange={onToggleSelectAll}
                      className="rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                  </th>
                  {selectedTableInfo?.columns.map(col => (
                    <th
                      key={col.name}
                      className="px-4 py-3 text-left text-slate-300 font-semibold"
                    >
                      {col.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="border-t border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={e => {
                      if ((e.target as HTMLElement).tagName !== 'INPUT') {
                        onRowClick(row);
                      }
                    }}
                  >
                    <td
                      className="px-4 py-3"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => onToggleRowSelection(row.id)}
                        className="rounded border-slate-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                    </td>
                    {selectedTableInfo?.columns.map(col => (
                      <td key={col.name} className="px-4 py-3 text-slate-300">
                        {row[col.name] === null ? (
                          <span className="text-slate-500 italic">null</span>
                        ) : typeof row[col.name] === 'boolean' ? (
                          <span
                            className={`font-semibold ${
                              row[col.name] ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {row[col.name].toString()}
                          </span>
                        ) : typeof row[col.name] === 'object' ? (
                          <span className="text-purple-300 font-mono text-xs">
                            {JSON.stringify(row[col.name])}
                          </span>
                        ) : (
                          <span className="truncate max-w-xs block">
                            {String(row[col.name])}
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
