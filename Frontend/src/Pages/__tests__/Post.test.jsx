import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Post from '../Post';
import { getPost } from '../../Api/api';

// Mock the getPost API call
jest.mock('../../Api/api', () => ({
  getPost: jest.fn(),
}));

describe('Post Component', () => {
  const mockPost = {
    id: 'test-post-123',
    title: 'Test Post',
    content: 'This is a test post content',
    authorName: 'Test User',
    createdAt: { seconds: Date.now() / 1000 },
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should load and display a post', async () => {
    // Mock successful API response
    getPost.mockResolvedValueOnce(mockPost);

    render(
      <MemoryRouter initialEntries={['/post/test-post-123']}>
        <Routes>
          <Route path="/post/:postId" element={<Post />} />
        </Routes>
      </MemoryRouter>
    );

    // Should show loading state initially
    expect(screen.getByText('Loading post...')).toBeInTheDocument();

    // Wait for the post to load
    await waitFor(() => {
      expect(getPost).toHaveBeenCalledWith('test-post-123');
      expect(screen.getByText('Test Post')).toBeInTheDocument();
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });
  });

  it('should show error when post is not found', async () => {
    // Mock API error
    getPost.mockRejectedValueOnce(new Error('Post not found'));

    render(
      <MemoryRouter initialEntries={['/post/non-existent']}>
        <Routes>
          <Route path="/post/:postId" element={<Post />} />
        </Routes>
      </MemoryRouter>
    );

    // Should show loading state initially
    expect(screen.getByText('Loading post...')).toBeInTheDocument();

    // Wait for the error to appear
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch post/i)).toBeInTheDocument();
    });
  });

  it('should handle missing post ID', () => {
    render(
      <MemoryRouter initialEntries={['/post/']}>
        <Routes>
          <Route path="/post/:postId" element={<Post />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Post ID not found in the URL.')).toBeInTheDocument();
  });
});
