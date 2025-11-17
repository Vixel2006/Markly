import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";

interface SelectItem {
  id: string;
  name: string;
}

interface MultiSelectDropdownProps {
  items: SelectItem[];
  selectedItems: string[]; // Array of selected item IDs
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
  isMulti?: boolean;
  label?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  items,
  selectedItems,
  onSelectionChange,
  placeholder = "Select...",
  isMulti = false,
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleItemClick = useCallback(
    (itemId: string) => {
      if (isMulti) {
        const newSelection = selectedItems.includes(itemId)
          ? selectedItems.filter((id) => id !== itemId)
          : [...selectedItems, itemId];
        onSelectionChange(newSelection);
      } else {
        onSelectionChange([itemId]);
        setIsOpen(false); // Close dropdown after single selection
      }
    },
    [isMulti, selectedItems, onSelectionChange]
  );

  const handleClearSelection = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent dropdown from toggling
      onSelectionChange([]);
      if (!isMulti) {
        setIsOpen(false);
      }
    },
    [onSelectionChange, isMulti]
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayValue = isMulti
    ? selectedItems.length > 0
      ? `${selectedItems.length} selected`
      : placeholder
    : selectedItems.length > 0
    ? items.find((item) => item.id === selectedItems[0])?.name || placeholder
    : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}:
        </label>
      )}
      <button
        type="button"
        className="flex justify-between items-center w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-left cursor-pointer focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        onClick={handleToggle}
      >
        <span className="block truncate">{displayValue}</span>
        <span className="flex items-center">
          {selectedItems.length > 0 && (
            <X
              size={16}
              className="text-gray-400 hover:text-gray-600 mr-1"
              onClick={handleClearSelection}
            />
          )}
          <ChevronDown
            size={16}
            className={`transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto custom-scrollbar"
          >
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking search
                />
              </div>
            </div>
            <ul className="py-1">
              {filteredItems.length === 0 ? (
                <li className="text-gray-500 px-3 py-2 text-sm">No options</li>
              ) : (
                filteredItems.map((item) => (
                  <li
                    key={item.id}
                    className={`cursor-pointer select-none relative py-2 pl-10 pr-4 text-sm
                      ${selectedItems.includes(item.id) ? "bg-purple-50 text-purple-900" : "text-gray-900 hover:bg-gray-100"}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <span className="block truncate">{item.name}</span>
                    {selectedItems.includes(item.id) && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600">
                        ✓
                      </span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSelectDropdown;