import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where,
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { ApiError, handleFirestoreError } from './api.js';

// Event statuses
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// Event types
export const EVENT_TYPES = {
  MEETUP: 'meetup',
  WORKSHOP: 'workshop',
  CONFERENCE: 'conference',
  SOCIAL: 'social',
  OTHER: 'other'
};

/**
 * Add a new event
 * @param {Object} eventData - Event data to add
 * @param {string} eventData.title - Event title
 * @param {string} eventData.description - Event description
 * @param {Date} eventData.startDate - Event start date
 * @param {Date} eventData.endDate - Event end date (optional)
 * @param {string} eventData.location - Event location
 * @param {string} [eventData.image] - Optional event image URL
 * @param {string} [eventData.status=EVENT_STATUS.PUBLISHED] - Event status
 * @param {string} [eventData.type=EVENT_TYPES.OTHER] - Event type
 * @param {number} [eventData.maxAttendees] - Maximum number of attendees (optional)
 * @param {string} [eventData.registrationLink] - Registration URL (optional)
 * @param {boolean} [eventData.isFeatured=false] - Whether the event is featured
 * @param {string} [eventData.createdBy] - ID of the user who created the event
 * @returns {Promise<Object>} The created event with ID
 */
export const addEvent = async (eventData) => {
  try {
    // Validate required fields
    if (!eventData.title || !eventData.description || !eventData.startDate || !eventData.location) {
      throw new ApiError('Missing required fields', 'events/validation-error');
    }

    const eventWithTimestamps = {
      title: eventData.title,
      description: eventData.description,
      startDate: eventData.startDate instanceof Date ? Timestamp.fromDate(eventData.startDate) : eventData.startDate,
      endDate: eventData.endDate ? (eventData.endDate instanceof Date ? Timestamp.fromDate(eventData.endDate) : eventData.endDate) : null,
      location: eventData.location,
      image: eventData.image || '',
      status: eventData.status || EVENT_STATUS.PUBLISHED,
      type: eventData.type || EVENT_TYPES.OTHER,
      maxAttendees: eventData.maxAttendees || null,
      registrationLink: eventData.registrationLink || '',
      isFeatured: eventData.isFeatured || false,
      createdBy: eventData.createdBy || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'events'), eventWithTimestamps);
    return { 
      id: docRef.id, 
      ...eventWithTimestamps,
      // Convert Firestore Timestamp to Date for the client
      startDate: eventWithTimestamps.startDate.toDate(),
      endDate: eventWithTimestamps.endDate ? eventWithTimestamps.endDate.toDate() : null
    };
  } catch (error) {
    console.error('Error adding event:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Get an event by ID
 * @param {string} eventId - ID of the event to retrieve
 * @returns {Promise<Object>} The event data
 */
export const getEvent = async (eventId) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      throw new ApiError('Event not found', 'events/not-found');
    }
    
    const eventData = eventSnap.data();
    return {
      id: eventSnap.id,
      ...eventData,
      // Convert Firestore Timestamp to Date for the client
      startDate: eventData.startDate?.toDate(),
      endDate: eventData.endDate?.toDate(),
      createdAt: eventData.createdAt?.toDate(),
      updatedAt: eventData.updatedAt?.toDate()
    };
  } catch (error) {
    console.error('Error getting event:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Get all events with optional filtering and sorting
 * @param {Object} [options] - Options for filtering and sorting
 * @param {string} [options.status] - Filter by status
 * @param {string} [options.type] - Filter by event type
 * @param {boolean} [options.upcomingOnly=false] - Only return upcoming events
 * @param {boolean} [options.featuredOnly=false] - Only return featured events
 * @param {number} [options.limit] - Maximum number of events to return
 * @param {string} [options.orderBy='startDate'] - Field to order by
 * @param {'asc'|'desc'} [options.orderDirection='asc'] - Sort direction
 * @returns {Promise<Array>} Array of events
 */
export const getEvents = async (options = {}) => {
  try {
    const {
      status,
      type,
      upcomingOnly = false,
      featuredOnly = false,
      limit,
      orderBy: orderByField = 'startDate',
      orderDirection = 'asc'
    } = options;

    let eventsRef = collection(db, 'events');
    const conditions = [];

    if (status) {
      conditions.push(where('status', '==', status));
    }
    
    if (type) {
      conditions.push(where('type', '==', type));
    }
    
    if (upcomingOnly) {
      conditions.push(where('startDate', '>=', Timestamp.now()));
    }
    
    if (featuredOnly) {
      conditions.push(where('isFeatured', '==', true));
    }

    // Add ordering
    conditions.push(orderBy(orderByField, orderDirection));

    // Create the query with all conditions
    const q = query(eventsRef, ...conditions);
    const querySnapshot = await getDocs(q);
    
    // Process the results
    let events = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to Date for the client
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    });

    // Apply limit after processing if needed
    if (limit) {
      events = events.slice(0, limit);
    }

    return events;
  } catch (error) {
    console.error('Error getting events:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Update an existing event
 * @param {string} eventId - ID of the event to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} The updated event
 */
export const updateEvent = async (eventId, updates) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Convert Date objects to Firestore Timestamp if needed
    if (updateData.startDate && updateData.startDate instanceof Date) {
      updateData.startDate = Timestamp.fromDate(updateData.startDate);
    }
    if (updateData.endDate && updateData.endDate instanceof Date) {
      updateData.endDate = Timestamp.fromDate(updateData.endDate);
    }

    await updateDoc(eventRef, updateData);
    
    // Return the updated event
    return getEvent(eventId);
  } catch (error) {
    console.error('Error updating event:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Delete an event
 * @param {string} eventId - ID of the event to delete
 * @returns {Promise<void>}
 */
export const deleteEvent = async (eventId) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw handleFirestoreError(error);
  }
};

/**
 * Get upcoming events
 * @param {number} [limit=5] - Maximum number of events to return
 * @returns {Promise<Array>} Array of upcoming events
 */
export const getUpcomingEvents = async (limit = 5) => {
  return getEvents({
    status: EVENT_STATUS.PUBLISHED,
    upcomingOnly: true,
    orderBy: 'startDate',
    orderDirection: 'asc',
    limit
  });
};

/**
 * Get featured events
 * @param {number} [limit=3] - Maximum number of events to return
 * @returns {Promise<Array>} Array of featured events
 */
export const getFeaturedEvents = async (limit = 3) => {
  return getEvents({
    status: EVENT_STATUS.PUBLISHED,
    featuredOnly: true,
    orderBy: 'startDate',
    orderDirection: 'asc',
    limit
  });
};
