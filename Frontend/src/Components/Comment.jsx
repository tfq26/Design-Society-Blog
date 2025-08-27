import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const Comment = ({ comment, replies, onReply, onEdit, onDelete }) => {
  const { currentUser } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent);
    setIsReplying(false);
    setReplyContent('');
  };

  const isAuthor = currentUser && currentUser.uid === comment.authorId;

  return (
    <div className="flex flex-col space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg dark:bg-zinc-700">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold dark:text-white">{comment.authorName || 'Anonymous'}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
            </p>
          </div>
          {isAuthor && (
            <div className="flex space-x-2">
              <button onClick={() => onEdit(comment)} className="text-sm text-blue-600 hover:underline">Edit</button>
              <button onClick={() => onDelete(comment.id)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          )}
        </div>
        <p className="mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{comment.content}</p>
        <button onClick={() => setIsReplying(!isReplying)} className="mt-2 text-sm text-blue-600 hover:underline">Reply</button>

        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-4 ml-4 pl-4 border-l-2 border-gray-200 dark:border-zinc-600">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Replying to ${comment.authorName || 'Anonymous'}...`}
              className="w-full p-2 border rounded-lg dark:bg-zinc-600 dark:text-white dark:border-zinc-500"
              rows="2"
            />
            <div className="flex space-x-2 mt-2">
              <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm">Submit</button>
              <button type="button" onClick={() => setIsReplying(false)} className="px-3 py-1 bg-gray-200 text-black rounded-md text-sm dark:bg-zinc-500 dark:text-white">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {replies.length > 0 && (
        <div className="ml-8 pl-4 border-l-2 border-gray-200 dark:border-zinc-600 space-y-4">
          {replies.map(reply => (
            <Comment key={reply.id} comment={reply} replies={[]} onReply={onReply} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
