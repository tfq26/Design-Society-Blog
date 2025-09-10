import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPost, ERROR_TYPES, isErrorOfType, POST_TYPES } from '../Api/api';
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
import { FiImage, FiX } from 'react-icons/fi';
import '@mdxeditor/editor/style.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [postType, setPostType] = useState(POST_TYPES.REGULAR);
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      await addPost(title, content, postType, files, { 
        tags: tagArray, 
        isPinned: isPinned && currentUser.isAdmin,
        isFeatured: false
      });
      setError({ type: 'success', message: 'Post created successfully! Redirecting...' });
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      if (isErrorOfType(error, ERROR_TYPES.AUTH)) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(error.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorChange = useCallback((markdown) => {
    setContent(markdown);
  }, []);

  const imageUploadHandler = useCallback(async (file) => {
    if (!file.type.match('image.*')) {
      setError('Please upload an image file');
      return '';
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return '';
    }
    return URL.createObjectURL(file);
  }, []);

  const plugins = useCallback(() => [
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({ imageUploadHandler }),
    tablePlugin(),
    thematicBreakPlugin(),
    markdownShortcutPlugin(),
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
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">✍️ Create New Post</h1>

        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
            typeof error === 'string' || error.type !== 'success' 
              ? 'bg-red-50 border border-red-300 text-red-700' 
              : 'bg-green-50 border border-green-300 text-green-700'
          }`}>
            <span className="font-medium">
              {typeof error === 'string' ? error : error.message}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post type + pinned */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Post Type *</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value={POST_TYPES.REGULAR}>Regular Post</option>
                <option value={POST_TYPES.COMMUNITY}>Community Post</option>
                <option value={POST_TYPES.DESIGN_DOC}>Design Document</option>
              </select>
            </div>
            {currentUser?.isAdmin && (
              <div className="flex items-center">
                <input
                  id="isPinned"
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="isPinned" className="ml-2 text-sm text-gray-800">
                  Pin this post
                </label>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter post title"
              disabled={isSubmitting}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tag1, tag2, tag3"
              disabled={isSubmitting}
            />
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Content *</label>
            <div className="border border-gray-300 rounded-lg shadow-sm bg-white">
              <MDXEditor
                ref={editorRef}
                markdown={content}
                onChange={handleEditorChange}
                className="w-full bg-white"
                placeholder="Start writing your post here..."
                contentEditableClassName="prose max-w-none p-4"
                plugins={plugins()}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <button
                type="button"
                onClick={() => window.open('https://www.markdownguide.org/cheat-sheet/', '_blank')}
                className="text-blue-600 hover:underline"
              >
                Markdown Cheatsheet
              </button>
              <span>{content.length} characters</span>
            </div>
          </div>

          {/* File uploads */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">Attachments</label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-blue-500"
              >
                <FiImage className="mr-2" /> Add Files
              </button>
              <span className="text-gray-500">{files.length} selected</span>
            </div>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 border rounded-lg">
                    <span className="truncate text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
