import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3 sm:px-6 mt-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] hover:bg-gray-50 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] hover:bg-gray-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-[#6B7280]">
            Showing <span className="font-semibold text-[#111827]">{startItem}</span> to{' '}
            <span className="font-semibold text-[#111827]">{endItem}</span> of{' '}
            <span className="font-semibold text-[#111827]">{totalItems}</span> results
          </p>
        </div>

        <div>
          <nav className="isolate inline-flex -space-x-px rounded-lg shadow-2xs" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-lg border border-[#E5E7EB] bg-white p-2 text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] disabled:opacity-40"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  currentPage === page
                    ? 'z-10 bg-[#111827] text-white border-[#111827]'
                    : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-gray-50 hover:text-[#111827]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-lg border border-[#E5E7EB] bg-white p-2 text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] disabled:opacity-40"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
