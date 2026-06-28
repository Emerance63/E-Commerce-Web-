import React, { useState } from 'react';
import { FiStar, FiUser } from 'react-icons/fi';
import { useComments, useCreateComment } from '../api/comments';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingStates';

export const ProductComments = ({ productId }) => {
  const { data: comments, isLoading } = useComments(productId);
  const createComment = useCreateComment(productId);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    createComment.mutate(
      { productId, content: content.trim(), rating },
      { onSuccess: () => setContent('') }
    );
  };

  return (
    <section className="mt-12 bg-white rounded-3xl shadow-sm border border-secondary-100 p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">Customer Reviews</h2>

      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-secondary-50 rounded-xl border border-secondary-100">
        <label className="block text-sm font-medium text-secondary-700 mb-2">Your rating</label>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`p-1 ${star <= rating ? 'text-amber-400' : 'text-secondary-300'}`}
              aria-label={`Rate ${star} stars`}
            >
              <FiStar className="w-6 h-6 fill-current" />
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={3}
          className="w-full border border-secondary-300 rounded-lg px-4 py-3 text-sm focus:ring-primary-500 focus:border-primary-500"
          required
        />
        <Button type="submit" className="mt-3" isLoading={createComment.isPending}>
          Post Review
        </Button>
      </form>

      {isLoading ? (
        <LoadingSpinner />
      ) : comments?.length === 0 ? (
        <p className="text-secondary-500 text-center py-6">No reviews yet. Be the first to review!</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border border-secondary-100 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <div className="flex text-amber-400 text-sm">
                    {'★'.repeat(comment.rating || 0)}
                    <span className="text-secondary-300">{'★'.repeat(5 - (comment.rating || 0))}</span>
                  </div>
                  <p className="text-xs text-secondary-500">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
              </div>
              <p className="text-secondary-700 text-sm leading-relaxed">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
