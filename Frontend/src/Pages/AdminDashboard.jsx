import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CreatePost from './CreatePost';
import UserManagement from '../Components/Admin/UserManagement';

// A new component for creating events
const CreateEventForm = () => {
  const [eventData, setEventData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    image: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('New Event Data:', eventData);
    alert('Event created successfully! (Check console for data)');
    // Reset form
    setEventData({
      title: '', date: '', time: '', location: '', description: '', image: ''
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-eerie-black dark:text-beige">Create New Event</h2>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input type="text" name="title" id="title" value={eventData.title} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
            <input type="date" name="date" id="date" value={eventData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
            <input type="time" name="time" id="time" value={eventData.time} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" />
          </div>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <input type="text" name="location" id="location" value={eventData.location} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea name="description" id="description" value={eventData.description} onChange={handleChange} rows="4" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"></textarea>
        </div>
        <div>
          <button type="submit" className="w-full bg-[#e8a087] hover:bg-[#d89179] text-eerie-black font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md">
            Create Event
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('userManagement');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-eerie-black dark:text-beige mb-8">Admin Dashboard</h1>
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('userManagement')}
          className={`px-6 py-3 font-medium text-lg transition-colors whitespace-nowrap ${
            activeTab === 'userManagement' 
              ? 'border-b-2 border-[#e8a087] text-[#e8a087]' 
              : 'text-gray-500 dark:text-gray-400 hover:text-[#e8a087] dark:hover:text-[#e8a087]'
          }`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('createPost')}
          className={`px-6 py-3 font-medium text-lg transition-colors whitespace-nowrap ${
            activeTab === 'createPost' 
              ? 'border-b-2 border-[#e8a087] text-[#e8a087]' 
              : 'text-gray-500 dark:text-gray-400 hover:text-[#e8a087] dark:hover:text-[#e8a087]'
          }`}
        >
          Create Post
        </button>
        <button 
          onClick={() => setActiveTab('createEvent')}
          className={`px-6 py-3 font-medium text-lg transition-colors whitespace-nowrap ${
            activeTab === 'createEvent' 
              ? 'border-b-2 border-[#e8a087] text-[#e8a087]' 
              : 'text-gray-500 dark:text-gray-400 hover:text-[#e8a087] dark:hover:text-[#e8a087]'
          }`}
        >
          Create Event
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {activeTab === 'userManagement' && <UserManagement />}
        {activeTab === 'createPost' && <CreatePost />}
        {activeTab === 'createEvent' && <CreateEventForm />}
      </div>
    </div>
  );
};

export default AdminDashboard;
