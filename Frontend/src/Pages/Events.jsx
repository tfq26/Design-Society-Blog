import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin, Filter, X } from 'lucide-react';
import { getAllEvents, EVENT_STATUS, EVENT_TYPES } from '../Api/events';

// Define filter options based on the imported constants
const statusOptions = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(EVENT_STATUS || {}).map(([key, value]) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1)
  }))
];

const typeOptions = [
  { value: '', label: 'All Types' },
  ...Object.entries(EVENT_TYPES || {}).map(([key, value]) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1)
  }))
];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    limit: 10
  });
  const [showFilters, setShowFilters] = useState(false);

  // Memoized function to fetch events from the API
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching events with filters:', { ...filters, page });
      
      const result = await getAllEvents({
        ...filters,
        orderBy: 'startDate',
        orderDirection: 'desc'
      });
      
      const eventsData = result?.events || [];
      console.log('Received events data:', eventsData);

      if (!eventsData || eventsData.length === 0) {
        console.log('No events found for the current filters');
        setEvents(prev => page === 1 ? [] : prev);
        setError(page === 1 ? 'No events found matching your criteria.' : null);
        setHasMore(false);
        return;
      }

      // Format event data for display
      const formattedEvents = eventsData.map(event => {
        const startDate = event.startDate?.toDate ? event.startDate.toDate() : new Date(event.startDate);
        return {
          ...event,
          date: startDate,
          formattedDate: startDate?.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) || 'Date TBD',
          formattedTime: startDate?.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }) || 'Time TBD',
          image: event.image || 'https://images.unsplash.com/photo-1505373876331-7d3ec96f211a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'
        };
      });

      // Update the events state based on the current page
      setEvents(prev => page === 1 ? formattedEvents : [...prev, ...formattedEvents]);
      setHasMore(eventsData.length === filters.limit);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', {
        error: err,
        message: err.message,
        stack: err.stack,
        filters: { ...filters, page }
      });
      setError(`Failed to load events. ${err.message || 'Please try again later.'}`);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // UseEffects to trigger data fetching
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.type]);

  // Handler for filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handler to clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      type: '',
      limit: 10
    });
  };

  // Handler to load more events
  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const activeFilterCount = [filters.status, filters.type].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white dark:bg-eerie-black text-eerie-black dark:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-eerie-black dark:text-white mb-4">
            Events
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Discover and join our upcoming events
          </p>
          <div className="h-1 w-24 bg-orange-wheel rounded-full mx-auto mt-4"></div>
        </div>

    {/* Filters */}
    <div className="mb-10 bg-white dark:bg-ash-gray rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-orange-wheel text-white font-medium hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <Filter size={18} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs font-semibold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
          >
            <X size={14} className="mr-1" /> Clear all
          </button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none px-3 py-2"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Event Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none px-3 py-2"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Events Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event) => (
        <motion.div
          key={event.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-ash-gray rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700"
        >
          <div className="relative h-52 overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1505373876331-7d3ec96f211a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80';
              }}
            />
            <span className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full bg-orange-wheel text-white shadow">
              {event.type || "Event"}
            </span>
          </div>
          <div className="p-6">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 space-x-3">
              <span className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1 text-orange-wheel" />
                {event.formattedDate}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-orange-wheel" />
                {event.formattedTime}
              </span>
            </div>
            <h3 className="text-xl font-bold text-eerie-black dark:text-white mb-2 group-hover:text-orange-wheel transition-colors line-clamp-2">
              {event.title}
            </h3>
            {event.location && (
              <p className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
                <MapPin className="w-4 h-4 mr-1 text-orange-wheel" />
                {event.location}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              {event.description || "No description available."}
            </p>
            <div className="flex justify-between items-center">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  event.status === "published"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                }`}
              >
                {event.status || "draft"}
              </span>
              <Link
                to={`/events/${event.id}`}
                className="text-sm font-medium text-orange-wheel hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors flex items-center"
              >
                View Details <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Load More */}
    {hasMore && (
      <div className="mt-12 text-center">
        <button
          onClick={loadMore}
          disabled={loading}
          className="px-8 py-3 bg-orange-wheel text-white rounded-lg font-medium shadow-md hover:bg-opacity-90 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Load More Events"}
        </button>
      </div>
    )}
    
    {events.length === 0 && !loading && (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No events found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {activeFilterCount > 0 
            ? "Try adjusting your filters or check back later."
            : "There are no upcoming events at the moment. Please check back soon!"
          }
        </p>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-orange-wheel hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    )}
  </div>
</div>
  );
};

export default Events;