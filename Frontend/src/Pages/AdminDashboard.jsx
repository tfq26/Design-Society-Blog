import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiFileText,
  FiPlus,
  FiSun,
  FiMoon,
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { addEvent, getEvents } from "../Api/events";
import CreateEventForm from "../Components/Admin/CreateEventForm";
import CreatePostForm from "../Components/Admin/CreatePostForm";
import { format } from "date-fns";
import AdminSidebar from "../Components/Admin/AdminSidebar";

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showEventForm, setShowEventForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
    document.documentElement.classList.toggle("dark");
  };

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else if (!currentUser.isAdmin) {
      navigate("/"); // Redirect to home if not admin
    } else {
      loadEvents();
    }
  }, [currentUser, navigate]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await getEvents({
        orderBy: "startDate",
        orderDirection: "desc",
      });
      setEvents(eventsData);
    } catch (error) {
      console.error("Error loading events:", error);
      setError("Failed to load events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
      setError("Failed to log out. Please try again.");
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      const eventWithCreator = {
        ...eventData,
        createdBy: currentUser.uid,
        status: "published",
        type: "event",
        createdAt: new Date().toISOString(),
      };

      await addEvent(eventWithCreator);
      await loadEvents();

      setShowEventForm(false);
      setEditingItem(null);

      setSuccess("Event saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving event:", error);
      setError(
        "Failed to save event. " + (error.message || "Please try again.")
      );
    }
  };

  const handleSavePost = async (postData) => {
    try {
      console.log("Saving post:", postData);
      setShowPostForm(false);
      setEditingItem(null);

      setSuccess("Post saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving post:", error);
      setError("Failed to save post. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowEventForm(false);
    setShowPostForm(false);
    setEditingItem(null);
  };

  /** --- Render Events --- */
  const renderEventsContent = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {showEventForm && (
            <button
              onClick={() => {
                setShowEventForm(false);
                setEditingItem(null);
              }}
              className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <FiArrowLeft size={24} />
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {showEventForm
              ? editingItem
                ? "Edit Event"
                : "Create New Event"
              : "Events"}
          </h2>
        </div>
        {!showEventForm && (
          <button
            onClick={() => setShowEventForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Event
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded flex items-center">
          <FiCheckCircle className="mr-2" /> {success}
        </div>
      )}

      {showEventForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all">
          <CreateEventForm
            onSave={handleSaveEvent}
            onCancel={handleCancel}
            initialData={editingItem || {}}
          />
        </div>
      ) : isLoading ? (
        <div className="flex flex-col justify-center items-center p-12 text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500 mb-4"></div>
          Loading events...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No events found. Click the "Add Event" button to create your first
            event.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {["Title", "Date", "Location", "Status", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {event.description?.substring(0, 50)}
                        {event.description?.length > 50 ? "..." : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {format(new Date(event.startDate), "MMM d, yyyy h:mm a")}
                      {event.endDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          to {format(new Date(event.endDate), "MMM d, yyyy h:mm a")}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {event.location}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                          event.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(event);
                          setShowEventForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  /** --- Render Posts --- */
  const renderPostsContent = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {showPostForm ? (editingItem ? "Edit Post" : "Create New Post") : "Posts"}
        </h2>
        {!showPostForm && (
          <button
            onClick={() => setShowPostForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Post
          </button>
        )}
      </div>

      {showPostForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <CreatePostForm
            onSave={handleSavePost}
            onCancel={handleCancel}
            initialData={editingItem || {}}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No posts found. Click the "Add Post" button to create your first
            post.
          </p>
        </div>
      )}
    </div>
  );

  /** --- Render Main Content --- */
  const renderContent = () => {
    switch (activeTab) {
      case "events":
        return renderEventsContent();
      case "posts":
        return renderPostsContent();
      default:
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Welcome Back
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Hello, {currentUser?.displayName || "Admin"}!
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Quick Actions
              </h3>
              <div className="mt-2 space-y-2">
                <button
                  onClick={() => {
                    setActiveTab("posts");
                    setShowPostForm(true);
                  }}
                  className="w-full text-left text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + Create New Post
                </button>
                <button
                  onClick={() => {
                    setActiveTab("events");
                    setShowEventForm(true);
                  }}
                  className="w-full text-left text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + Add New Event
                </button>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Recent Activity
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                No recent activity yet.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`flex h-screen ${darkMode ? "dark" : ""} bg-gray-50 dark:bg-gray-900`}
    >
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {activeTab}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {darkMode ? (
                  <FiSun className="h-6 w-6 text-yellow-500" />
                ) : (
                  <FiMoon className="h-6 w-6 text-gray-500" />
                )}
              </button>
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                {currentUser?.displayName?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
