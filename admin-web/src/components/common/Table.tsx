import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado.',
  pageSize = 10,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="bg-[#121212] rounded-sm border border-white/10 p-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-neutral-800 rounded-sm w-1/4"></div>
          <div className="h-10 bg-neutral-900 rounded-sm w-full"></div>
          <div className="h-10 bg-neutral-900 rounded-sm w-full"></div>
          <div className="h-10 bg-neutral-900 rounded-sm w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121212] rounded-sm border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#F5F5F5]">
          <thead className="bg-[#1A1A1A] border-b border-white/10 text-[#E0FF00] uppercase font-black tracking-widest text-[10px]">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="p-3.5">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-neutral-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-mono text-xs uppercase tracking-wider">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-[#181818] transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className="p-3.5 align-middle">
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? '') : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="p-3 bg-[#141414] border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>
            PÁGINA <strong className="text-[#E0FF00]">{currentPage}</strong> DE <strong className="text-[#F5F5F5]">{totalPages}</strong> ({data.length} ITENS)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-sm border border-neutral-700 bg-[#1A1A1A] text-[#F5F5F5] hover:bg-white hover:text-black disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-sm border border-neutral-700 bg-[#1A1A1A] text-[#F5F5F5] hover:bg-white hover:text-black disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
