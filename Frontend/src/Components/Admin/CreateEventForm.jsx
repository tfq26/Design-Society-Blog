import React, { useState } from 'react';
import { FiX, FiUpload, FiCalendar, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateEventForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    location: initialData.location || '',
    startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
    endDate: initialData.endDate ? new Date(initialData.endDate) : new Date(),
    image: initialData.image || '',
    isFeatured: initialData.isFeatured || false,
    maxAttendees: initialData.maxAttendees || '',
    registrationLink: initialData.registrationLink || ''
  });
  const [imagePreview, setImagePreview] = useState(initialData.image || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title || !formData.description || !formData.location) {
      setError('Title, description, and location are required');
      return;
    }

    if (formData.startDate > formData.endDate) {
      setError('End date must be after start date');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null
      });
      setSuccess(true);

      // Auto close after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onCancel();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      {/* Success Popup */}
      {success && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 flex flex-col items-center">
            <FiCheckCircle className="text-green-500 text-5xl mb-3" />
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Event saved successfully!
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {initialData.id ? 'Edit Event' : 'Create New Event'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Event Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter event title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter event details"
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Start Date *
            </label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => handleDateChange(date, 'startDate')}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              End Date *
            </label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => handleDateChange(date, 'endDate')}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={formData.startDate}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Location *
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Enter event location"
            required
          />
        </div>

        {/* Max Attendees & Registration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="maxAttendees" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Maximum Attendees
            </label>
            <input
              id="maxAttendees"
              name="maxAttendees"
              type="number"
              min="1"
              value={formData.maxAttendees}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. 100"
            />
          </div>
          <div>
            <label htmlFor="registrationLink" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Registration Link
            </label>
            <input
              id="registrationLink"
              name="registrationLink"
              type="url"
              value={formData.registrationLink}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="https://example.com/register"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Event Image
          </label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 py-2 px-4 rounded-lg border border-indigo-300 dark:border-indigo-700 inline-flex items-center">
              <FiUpload className="mr-2" />
              Upload Image
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setFormData(prev => ({ ...prev, image: '' }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <FiX size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center">
          <input
            id="isFeatured"
            name="isFeatured"
            type="checkbox"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700 dark:text-gray-200">
            Feature this event on the homepage
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
