import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { getEventById } from '../Api/events';

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEventById(id);
        if (eventData) {
          setEvent({
            ...eventData,
            date: eventData.startDate?.toDate ? eventData.startDate.toDate() : new Date(eventData.startDate),
            endDate: eventData.endDate?.toDate ? eventData.endDate.toDate() : eventData.endDate ? new Date(eventData.endDate) : null
          });
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e8a087]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link
            to="/events"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const formattedDate = event.date?.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) || 'Date TBD';

  const formattedTime = event.date?.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) || 'Time TBD';

  const formattedEndTime = event.endDate?.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/events"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Events
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="relative h-64 md:h-80 w-full">
            <img
              src={event.image || 'https://images.unsplash.com/photo-1505373876331-7d3ec96f211a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80'}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1505373876331-7d3ec96f211a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80';
              }}
            />
            <div className="absolute bottom-4 right-4">
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {event.type || 'Event'}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {event.title}
                </h1>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span>{formattedDate}</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    {formattedTime}
                    {formattedEndTime && ` - ${formattedEndTime}`}
                  </span>
                </div>
              </div>
              <span className={`mt-4 md:mt-0 px-4 py-2 text-sm font-medium rounded-full ${
                event.status === 'published'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {event.status || 'draft'}
              </span>
            </div>

            {event.location && (
              <div className="flex items-start mb-6">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Location</h3>
                  <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
                </div>
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">About This Event</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {event.description || 'No description available for this event.'}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Register for Event
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
