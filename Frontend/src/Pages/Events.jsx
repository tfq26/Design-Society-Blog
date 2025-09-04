import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Calendar from "../Components/Calendar";

// Sample event data
const sampleEvents = [
  {
    id: 1,
    title: "Design Society Meeting",
    date: "September 5, 2025",
    time: "6:00 PM - 8:00 PM",
    location: "SCI 1.201",
    description: "Join us for our weekly Design Society meeting where we'll discuss upcoming projects and events.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: 2,
    title: "Workshop: UI/UX Design",
    date: "September 12, 2025",
    time: "5:00 PM - 7:00 PM",
    location: "SCI 2.101",
    description: "Learn the fundamentals of UI/UX design with hands-on activities and real-world examples.",
    image: "https://images.unsplash.com/photo-1541462608143-67571c6738dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
  },
  {
    id: 3,
    title: "Guest Speaker Series",
    date: "September 19, 2025",
    time: "6:30 PM - 8:30 PM",
    location: "SCI 1.301",
    description: "Hear from industry professionals about their journey in the design field and get career advice.",
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1704&q=80"
  }
];
const Events = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check for dark mode on component mount and when it changes
  React.useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Initial check
    checkDarkMode();
    
    // Set up a mutation observer to watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);
  
  const upcomingEvents = sampleEvents.filter(event => new Date(event.date) >= new Date());
  const pastEvents = sampleEvents.filter(event => new Date(event.date) < new Date());
  

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-eerie-black dark:text-beige">
          Events Calendar
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Stay updated with our upcoming events and workshops
        </p>
        <div className="h-1 w-24 bg-[#e8a087] rounded-full"></div>
      </motion.div>
      
      {/* Calendar Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-16 bg-white dark:bg-ash-gray rounded-xl shadow-lg overflow-hidden"
      >
        <Calendar />
      </motion.div>

      {/* Upcoming Events Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-eerie-black dark:text-beige">
            Upcoming Events
          </h2>
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'upcoming' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-4 py-2 rounded-md transition-colors ${
                activeTab === 'past' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'upcoming' ? upcomingEvents : pastEvents).map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-ash-gray rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              <div className="h-40 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-eerie-black dark:text-beige">
                    {event.title}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-orange-100">
                    {event.date}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-100 mb-4">
                  <svg 
                    className="w-4 h-4 mr-2 text-[#e8a087]" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                  {event.location}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 line-clamp-3">
                  {event.description}
                </p>
                <div className="mt-auto">
                  <Link to={`/event/${event.id}`} className="block w-full">
                    <button className="w-full bg-[#e8a087] hover:bg-[#d89179] text-eerie-black dark:text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-md">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold mb-8 text-eerie-black dark:text-beige">
          Past Events
        </h2>
        <div className="grid gap-6">
          {pastEvents.map((event, index) => (
            <div
              key={index}
              className="bg-white dark:bg-ash-gray rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center p-6">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Event Image
                    </p>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-semibold mb-3 text-eerie-black dark:text-beige">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {event.description}
                  </p>
                  <div className="mt-4">
                    <button className="text-[#e8a087] hover:text-[#d89179] font-medium transition-colors duration-200">
                      View Gallery →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add a call-to-action section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-[#e8a087] to-[#5c9eac] rounded-2xl p-8 text-center text-white"
      >
        <h2 className="text-3xl font-bold mb-4">Want to host an event with us?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Partner with Design Society to create memorable experiences and reach a community of design enthusiasts.
        </p>
        <button className="bg-white text-eerie-black hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg">
          Contact Us
        </button>
      </motion.div>

      <style jsx global>{`
        .slick-prev:before,
        .slick-next:before {
          font-size: 24px;
        }
        .slick-prev {
          left: -35px;
        }
        .slick-next {
          right: -35px;
        }
        .slick-dots li.slick-active div {
          background-color: ${isDarkMode ? '#F5F5F5' : '#1E1E1E'} !important;
        }
        .slick-dots li div {
          background-color: ${isDarkMode ? '#4B5563' : '#D1D5DB'};
          transition: background-color 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Events;