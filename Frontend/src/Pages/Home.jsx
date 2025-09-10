import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaStar, FaImage, FaBook, FaPencilAlt } from 'react-icons/fa';

// Hero image is in the public directory

const Home = () => {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  const sections = [
    {
      title: 'About Us',
      description: 'Learn more about our mission and the dedicated team behind our society.',
      path: '/about',
      icon: <FaUsers size={32} className="text-royal-blue" />,
    },
    {
      title: 'Events',
      description: 'Discover our upcoming workshops, seminars, and networking events.',
      path: '/events',
      icon: <FaCalendarAlt size={32} className="text-mint-green" />,
    },
    {
      title: 'Membership',
      description: 'Join our vibrant community and unlock exclusive resources and opportunities.',
      path: '/membership',
      icon: <FaStar size={32} className="text-golden-yellow" />,
    },
    {
      title: 'Gallery',
      description: 'Explore winning projects and creative works from our past design challenges.',
      path: '/gallery',
      icon: <FaImage size={32} className="text-slate-gray" />,
    },
    {
      title: 'Resources',
      description: 'Access a curated list of recommended learning materials and design tools.',
      path: '/resources',
      icon: <FaBook size={32} className="text-burnt-orange" />,
    },
    {
      title: 'Blog',
      description: 'Read our latest articles, interviews, and design insights from our members.',
      path: '/blog',
      icon: <FaPencilAlt size={32} className="text-crimson-red" />,
    },
  ];

  return (
    <div className="text-gray-900 dark:text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-80 md:h-96">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <img
            src="/hero.jpg"
            alt="Design Society Student Chapter"
            className="w-full h-full object-cover transform scale-105 transition-transform duration-1000 ease-in-out hover:scale-100"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40 flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
              Welcome to Design Society!
            </h1>
            <p className="text-lg md:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
              Fostering creativity, collaboration, and innovation among design enthusiasts.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto py-12 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-eerie-black dark:text-white">
          Explore Our Community
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div
              key={section.title}
              onClick={() => navigateTo(section.path)}
              className="bg-white dark:bg-ash-gray p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500 flex flex-col items-center text-center"
            >
              <div className="mb-4">
                {section.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-2 text-eerie-black dark:text-white">
                {section.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;