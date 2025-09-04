import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Mock data - in a real app, you'd fetch this based on the id
const upcomingEvents = [
    {
        id: 1,
        title: "Design Society Meeting",
        date: "September 5, 2025",
        location: "SCI 1.201",
        description: "Join us for our first meeting of the semester! We'll be discussing our plans for the year, upcoming workshops, and how you can get involved. This is a great opportunity to meet fellow design enthusiasts and kickstart your creative journey.",
        time: "6:00 PM - 8:00 PM",
        organizer: "Jane Doe",
        tags: ["Meeting", "Social", "Networking"]
    },
    {
        id: 2,
        title: "Intro to Figma Workshop",
        date: "September 12, 2025",
        location: "ONLINE",
        description: "Whether you're a beginner or looking to refresh your skills, this workshop will cover the fundamentals of Figma. Learn how to create wireframes, prototypes, and collaborate with your team in real-time. No prior experience needed!",
        time: "7:00 PM - 9:00 PM",
        organizer: "John Smith",
        tags: ["Workshop", "Figma", "UI/UX"]
    },
    {
        id: 3,
        title: "Guest Speaker Series: The Future of AI in Design",
        date: "September 19, 2025",
        location: "SCI 1.301",
        description: "We're excited to host a leading expert in the field of AI and design. This talk will explore how artificial intelligence is shaping the future of creative industries and what it means for designers. Q&A session to follow.",
        time: "6:30 PM - 8:30 PM",
        organizer: "AI Innovations Inc.",
        tags: ["Guest Speaker", "AI", "Future Tech"]
    },
];

const EventDetails = () => {
  const { eventId } = useParams();
  const event = upcomingEvents.find(e => e.id === parseInt(eventId));

  if (!event) {
    return <div className="text-center py-10">Event not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <Link to="/events" className="inline-flex items-center text-[#e8a087] hover:text-[#d89179] font-medium transition-colors duration-200">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Events
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h1 className="text-4xl font-bold text-eerie-black dark:text-beige mb-2">{event.title}</h1>
          <div className="flex items-center text-lg text-gray-600 dark:text-gray-300 mb-6">
            <span className="mr-4">{event.date}</span>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-md text-gray-500 dark:text-gray-400 mb-6">
             <svg className="w-5 h-5 mr-2 text-[#e8a087]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {event.location}
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            {event.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {event.tags.map(tag => (
              <span key={tag} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventDetails;
