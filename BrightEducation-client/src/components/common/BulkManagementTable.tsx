import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiSearch, FiFilter, FiDownload, FiMoreVertical, FiTrash2 } from 'react-icons/fi';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface Action<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (row: T) => void;
  danger?: boolean;
}

export interface BulkManagementTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: keyof T;
  statusColumn?: {
    key: keyof T;
    getStatus: (value: any) => { label: string; color: string };
  };
  rowActions?: Action<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  primaryAction?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  };
  onDeleteSelected?: (selectedIds: string[]) => void;
  onExport?: () => void;
  onFilter?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

function BulkManagementTable<T>({
  data,
  columns,
  rowKey,
  statusColumn,
  rowActions,
  onRowClick,
  loading,
  error,
  emptyMessage = 'No data found',
  primaryAction,
  onDeleteSelected,
  onExport,
  onFilter,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  pagination,
}: BulkManagementTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left: number } | null>(null);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (actionMenuOpen) {
        setActionMenuOpen(null);
        setActionMenuPosition(null);
      }
    };

    if (actionMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [actionMenuOpen]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map((row) => String(row[rowKey])));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleDeleteSelected = () => {
    if (onDeleteSelected && selectedIds.size > 0) {
      onDeleteSelected(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const toggleActionMenu = (id: string, event: React.MouseEvent) => {
    if (actionMenuOpen === id) {
      setActionMenuOpen(null);
      setActionMenuPosition(null);
    } else {
      setActionMenuOpen(id);
      const rect = event.currentTarget.getBoundingClientRect();
      setActionMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192 + window.scrollX, // 192 is the width of the dropdown
      });
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.size === data.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  return (
    <div className="w-full">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && onDeleteSelected && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <FiTrash2 className="w-4 h-4" />
              Delete ({selectedIds.size})
            </button>
          )}
          {onFilter && (
            <button
              onClick={onFilter}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <FiFilter className="w-4 h-4" />
              Filter
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          )}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        )}
        {error && (
          <div className="text-red-600 p-6 text-center font-medium">{error}</div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto" style={{ overflowX: 'auto', overflowY: 'visible' }}>
            {data.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-medium">{emptyMessage}</div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* Select All Checkbox */}
                      <th className="px-4 py-3 w-12">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(el) => {
                            if (el) el.indeterminate = isSomeSelected;
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      {/* Columns */}
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                            column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                          }`}
                          onClick={() => column.sortable && handleSort(column.key)}
                        >
                          <div className="flex items-center gap-1">
                            {column.label}
                            {column.sortable && sortColumn === column.key && (
                              <span className="text-gray-400">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                      {/* Status Column */}
                      {statusColumn && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      )}
                      {/* Actions Column */}
                      {rowActions && rowActions.length > 0 && (
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row) => {
                      const rowId = String(row[rowKey]);
                      const isSelected = selectedIds.has(rowId);
                      return (
                        <tr
                          key={rowId}
                          onClick={() => onRowClick?.(row)}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          {/* Row Checkbox */}
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          {/* Data Columns */}
                          {columns.map((column) => (
                            <td key={column.key} className="px-4 py-3 text-sm text-gray-900">
                              {column.render ? column.render(row) : String(row[column.key as keyof T] || '')}
                            </td>
                          ))}
                          {/* Status Column */}
                          {statusColumn && (
                            <td className="px-4 py-3">
                              {(() => {
                                const statusValue = row[statusColumn.key];
                                const status = statusColumn.getStatus(statusValue);
                                return (
                                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                    {status.label}
                                  </span>
                                );
                              })()}
                            </td>
                          )}
                          {/* Actions Column */}
                          {rowActions && rowActions.length > 0 && (
                            <td className="px-4 py-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                              <div className="relative inline-block">
                                <button
                                  onClick={(e) => toggleActionMenu(rowId, e)}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <FiMoreVertical className="w-4 h-4" />
                                </button>
                                {actionMenuOpen === rowId && rowActions && rowActions.length > 0 && actionMenuPosition && createPortal(
                                  <div 
                                    className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                                    style={{ top: actionMenuPosition.top, left: actionMenuPosition.left }}
                                  >
                                    {rowActions.map((action, index) => (
                                      <button
                                        key={index}
                                        onClick={() => {
                                          action.onClick(row);
                                          setActionMenuOpen(null);
                                          setActionMenuPosition(null);
                                        }}
                                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${
                                          action.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                                        }`}
                                      >
                                        {action.icon}
                                        {action.label}
                                      </button>
                                    ))}
                                  </div>,
                                  document.body
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BulkManagementTable;
