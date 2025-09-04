// src/pages/Home.jsx
import React from "react";
import Hero from "/hero.jpg";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative w-full rounded-xl overflow-hidden mb-8 shadow-lg">
        <img
          src={Hero}
          alt="Hero"
          className="w-full h-64 md:h-96 object-cover block"
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 px-4">
            Welcome to Design Society Student Chapter!
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl px-4">
            We foster creativity and collaboration among design enthusiasts.
          </p>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* About Us */}
        <div 
          className="p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl dark:bg-ash-gray bg-beige text-black dark:text-white"
          onClick={() => navigateTo('/about')}
        >
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--eerie-black)' }}>About Us</h3>
          <p className="leading-relaxed">
            Learn more about our mission and team.
          </p>
        </div>

        {/* Events */}
        <div 
          className="p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl dark:bg-ash-gray bg-beige text-black dark:text-white"
          onClick={() => navigateTo('/events')}
        >
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--eerie-black)' }}>Events</h3>
          <p className="leading-relaxed">
            Check out our upcoming events and activities.
          </p>
        </div>

        {/* Membership */}
        <div 
          className="p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl dark:bg-ash-gray bg-beige text-black dark:text-white"
          onClick={() => navigateTo('/membership')}
        >
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--eerie-black)' }}>Membership</h3>
          <p className="leading-relaxed">
            Join us and be part of our vibrant community.
          </p>
        </div>

        {/* Gallery */}
        <div 
          className="p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl dark:bg-ash-gray bg-beige text-black dark:text-white"
          onClick={() => navigateTo('/gallery')}
        >
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--eerie-black)' }}>Gallery</h3>
          <p className="leading-relaxed">
            Get inspired by seeing winning projects from our design challenge.
          </p>
        </div>

        {/* Resources */}
        <div 
          className="p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl dark:bg-ash-gray bg-beige text-black dark:text-white"
          onClick={() => navigateTo('/resources')}
        >
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--eerie-black)' }}>Resources</h3>
          <p className="leading-relaxed">
            Learn more by viewing recommended resources.
          </p>
        </div>

        {/* Blog */}
        <div 
          className="p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl dark:bg-ash-gray bg-beige text-black dark:text-white"
          onClick={() => navigateTo('/blog')}
        >
          <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--eerie-black)' }}>Blog</h3>
          <p className="leading-relaxed">
            Read our latest articles and design insights.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;