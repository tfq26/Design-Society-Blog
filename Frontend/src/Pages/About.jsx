import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaLightbulb, FaHandsHelping } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-eerie-black text-gray-900 dark:text-white font-sans space-y-10">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6 ">
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 ease-in-out font-medium "
        >
          <FaArrowLeft className="mr-2" /> Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-wheel/95 to-orange-wheel/85 text-beige py-24 shadow-lg rounded-2xl">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in-down">About Design Society <br/> <br/> at the University of Texas at Dallas</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-0 animate-fade-in delay-200">
            Empowering the next generation of designers through collaboration, education, and innovation.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-gray-800 rounded-2xl">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-1 bg-orange-wheel dark:bg-orange-wheel mx-auto mb-8 animate-widen"></div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800 dark:text-white">Our Mission</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-12">
              We are dedicated to fostering a community where design enthusiasts can connect, learn, and grow together. 
              Our mission is to bridge the gap between education and industry, providing resources and opportunities 
              for students to develop their skills and make meaningful contributions to the design world.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800 dark:text-white">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Community Card */}
            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-orange-wheel/10 dark:bg-orange-wheel/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaUsers className="text-orange-wheel text-4xl" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-center text-gray-800 dark:text-white">Community</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                We believe in the power of community to inspire and support each other's growth and success in design.
              </p>
            </div>

            {/* Innovation Card */}
            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-orange-wheel/10 dark:bg-orange-wheel/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaLightbulb className="text-orange-wheel text-4xl" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-center text-gray-800 dark:text-white">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                We encourage creative thinking and pushing boundaries to develop new ideas and solutions in design.
              </p>
            </div>

            {/* Collaboration Card */}
            <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-orange-wheel/10 dark:bg-orange-wheel/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaHandsHelping className="text-orange-wheel text-4xl" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-center text-gray-800 dark:text-white">Collaboration</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                We believe that the best designs come from working together and learning from diverse perspectives.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;