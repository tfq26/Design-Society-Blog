import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPost, ERROR_TYPES, isErrorOfType } from '../Api/api';
import { useAuth } from '../hooks/useAuth';
import { 
  MDXEditor,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  CodeMirrorEditor,
  listsPlugin,
  quotePlugin,
  headingsPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin
} from '@mdxeditor/editor';
import { storage } from '../Api/api';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FiImage, FiEye, FiEdit, FiX, FiSave } from 'react-icons/fi';
import '@mdxeditor/editor/style.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const editorRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    if (title.trim().length < 5) {
      setError('Title should be at least 5 characters long');
      return;
    }
    
    if (content.trim().length < 20) {
      setError('Content should be at least 20 characters long');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to create a post');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addPost(title, content);
      // Show success message and navigate after a short delay
      setError({ type: 'success', message: 'Post created successfully! Redirecting...' });
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error("Error creating post:", error);
      
      // Handle specific error cases
      if (isErrorOfType(error, ERROR_TYPES.AUTH)) {
        setError('Your session has expired. Please log in again.');
      } else if (isErrorOfType(error, ERROR_TYPES.FIRESTORE)) {
        setError('Failed to save your post. Please try again.');
      } else if (isErrorOfType(error, ERROR_TYPES.VALIDATION)) {
        setError(error.message || 'Invalid input. Please check your post and try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        setError('Please upload an image file');
        return '';
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return '';
      }

      setIsUploading(true);
      const storageRef = ref(storage, `posts/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setError('');
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      return '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditorChange = useCallback((markdown) => {
    setContent(markdown);
  }, []);

  const imageUploadHandler = useCallback(async (file) => {
    const url = await handleImageUpload(file);
    return url;
  }, []);

  // Configure plugins
  const plugins = useCallback(() => [
    // List plugins
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({ imageUploadHandler }),
    tablePlugin(),
    thematicBreakPlugin(),
    markdownShortcutPlugin(),
    
    // Toolbar with essential formatting options
    toolbarPlugin({
      toolbarContents: () => (
        <>
          <UndoRedo />
          <BoldItalicUnderlineToggles />
          <CodeToggle />
          <ListsToggle />
          <BlockTypeSelect />
          <CreateLink />
          <InsertImage />
          <InsertTable />
          <InsertThematicBreak />
        </>
      )
    })
  ], [imageUploadHandler]);

  return (
    <div className="max-w-9xl mx-auto p-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Create a New Post</h1>
      </div>
      {error && (
        <div className={`mb-4 p-4 rounded ${
          error.type === 'success' 
            ? 'bg-green-50 border-l-4 border-green-400' 
            : 'bg-red-50 border-l-4 border-red-400'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {error.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm ${
                error.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {typeof error === 'string' ? error : error.message}
              </p>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2 dark:text-gray-300">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white rounded-lg"
            placeholder="My Awesome Blog Post"
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2 dark:text-gray-300">
            Content
          </label>
          <div className="border border-gray-300 dark:border-zinc-600 rounded-lg overflow-hidden">
            <MDXEditor
              ref={editorRef}
              markdown={content}
              onChange={handleEditorChange}
              className="min-h-[400px] w-auto bg-white"
              placeholder="Start writing your post here..."
              contentEditableClassName="prose dark:prose-invert prose-p:text-current max-w-none mx-4 py-4 dark:text-gray-100 [&_ol]:list-decimal [&_ul]:list-disc [&_ol]:pl-8 [&_ul]:pl-8 [&_li]:my-1 [&_li]:pl-1"
              plugins={plugins()}
            />
          </div>
          <div className="mt-2 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <button 
                type="button" 
                onClick={() => window.open('https://www.markdownguide.org/cheat-sheet/', '_blank')} 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Markdown Cheatsheet
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {content.length} characters
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
