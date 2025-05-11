// client/src/components/filterMenu/index.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FiFilter } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

const FilterMenu = ({
    isOpen,
    toggleFilter,
    onApplyFilter,
    filters,
    filterOptions
}) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const menuRef = useRef(null);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    useEffect(() => {
        // Close filter menu when clicking outside
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                toggleFilter(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [toggleFilter]);

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleApplyFilter = () => {
        onApplyFilter(localFilters);
        toggleFilter(false);
    };

    const handleClearFilter = () => {
        // Reset all filters to default values
        const clearedFilters = Object.keys(localFilters).reduce((acc, key) => {
            if (Array.isArray(localFilters[key])) {
                acc[key] = [];
            } else if (typeof localFilters[key] === 'object' && localFilters[key] !== null) {
                acc[key] = { start: '', end: '' };
            } else {
                acc[key] = '';
            }
            return acc;
        }, {});

        setLocalFilters(clearedFilters);
        onApplyFilter(clearedFilters);
    };

    // Dynamic filter rendering based on filterOptions
    const renderFilterFields = () => {
        return Object.entries(filterOptions).map(([key, options]) => {
            const { type, label, choices } = options;

            switch (type) {
                case 'select':
                    return (
                        <div key={key} className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <select
                                value={localFilters[key] || ''}
                                onChange={(e) => handleFilterChange(key, e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="">All</option>
                                {choices.map((choice) => (
                                    <option key={choice.value} value={choice.value}>
                                        {choice.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );

                case 'date':
                    return (
                        <div key={key} className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <div className="flex items-center gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">From</label>
                                    <input
                                        type="date"
                                        value={localFilters[key]?.start || ''}
                                        onChange={(e) => handleFilterChange(key, {
                                            ...localFilters[key],
                                            start: e.target.value
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">To</label>
                                    <input
                                        type="date"
                                        value={localFilters[key]?.end || ''}
                                        onChange={(e) => handleFilterChange(key, {
                                            ...localFilters[key],
                                            end: e.target.value
                                        })}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                    );

                case 'multiselect':
                    return (
                        <div key={key} className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <div className="flex flex-wrap gap-2">
                                {choices.map((choice) => (
                                    <label key={choice.value} className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={localFilters[key]?.includes(choice.value) || false}
                                            onChange={(e) => {
                                                const currentValues = localFilters[key] || [];
                                                const newValues = e.target.checked
                                                    ? [...currentValues, choice.value]
                                                    : currentValues.filter(val => val !== choice.value);
                                                handleFilterChange(key, newValues);
                                            }}
                                            className="form-checkbox h-4 w-4 text-blue-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{choice.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );

                default:
                    return null;
            }
        });
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => toggleFilter(true)}
                className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
            >
                <FiFilter size={16} />
                <span>Filter</span>
            </button>
        );
    }

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-10 z-10 bg-white rounded-md shadow-lg p-4 w-72 border border-gray-200"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                    onClick={() => toggleFilter(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <IoIosClose size={24} />
                </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {renderFilterFields()}
            </div>

            <div className="flex justify-between mt-4 pt-2 border-t border-gray-200">
                <button
                    onClick={handleClearFilter}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                    Clear All
                </button>
                <button
                    onClick={handleApplyFilter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );
};

export default FilterMenu;