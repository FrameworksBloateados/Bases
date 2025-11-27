import {useState} from 'react';
import {useDropdownAnimation} from '../hooks/useDropdownAnimation';
import {ChevronDownIcon} from './Icons';

type TableInfo = {
  name: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    default: string | null;
  }[];
};

type TableSelectorProps = {
  tables: TableInfo[];
  selectedTable: string;
  onTableChange: (tableName: string) => void;
};

export function TableSelector({
  tables,
  selectedTable,
  onTableChange,
}: TableSelectorProps) {
  const {
    isOpen: showDropdown,
    isClosing,
    toggle: toggleDropdown,
    close,
  } = useDropdownAnimation();

  const handleTableChange = (tableName: string) => {
    if (tableName === selectedTable) {
      close();
      return;
    }

    onTableChange(tableName);
    close();
  };

  return (
    <div className="relative z-50">
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 text-sm font-bold text-white bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 flex items-center gap-2 min-w-[200px] justify-between"
      >
        <span className="truncate">{selectedTable || 'Seleccionar tabla'}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-300 ${
            showDropdown && !isClosing ? 'rotate-180' : ''
          }`}
        />
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
                onClick={() => handleTableChange(table.name)}
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
  );
}
