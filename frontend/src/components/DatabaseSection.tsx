import {LoadingSpinner} from './LoadingSpinner';
import {TableSelector} from './TableSelector';
import {TableCell} from './TableCell';
import {SpinnerIcon, TrashIcon, PlusIcon} from './Icons';

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
  ongoingMatches?: any[];
  onOpenUploadMatch?: (match: any) => void;
};

/**
 * Database section component for Dashboard
 * Displays tables, data, and admin actions
 */
export function DatabaseSection({
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
            className={`px-4 py-2 text-sm font-bold rounded-lg shadow-lg transition-colors duration-300 whitespace-nowrap ${
              isDeleting
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-50'
                : selectedRows.size > 0
                ? 'text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-xl active:scale-99 opacity-100 scale-100'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed opacity-40 scale-95'
            }`}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <SpinnerIcon className="shrink-0" />
                Eliminando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <TrashIcon />
                {selectedRows.size > 0
                  ? `Eliminar (${selectedRows.size})`
                  : 'Eliminar'}
              </span>
            )}
          </button>

          {/* Insert Button */}
          <button
            onClick={onShowAddModal}
            className="px-4 py-2 text-sm font-bold rounded-lg shadow-lg transition-colors duration-300 whitespace-nowrap text-white bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 hover:shadow-xl active:scale-99"
          >
            <span className="flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
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
                        <TableCell
                          value={row[col.name]}
                          columnName={col.name}
                        />
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
