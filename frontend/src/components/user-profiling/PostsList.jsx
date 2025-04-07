"use client"

import { Heart, MessageCircle, Calendar, Image } from "lucide-react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

const PostsList = ({ posts, isOwnProfile }) => {
  if (posts.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {isOwnProfile ? "You haven't created any posts yet" : "No posts yet"}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {isOwnProfile ? "When you create posts, they'll appear here." : "This user hasn't shared any posts yet."}
        </p>
        {isOwnProfile && (
          <a
            href="/posts"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Post
          </a>
        )}
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {posts.map((post, index) => (
        <PostCard key={post._id} post={post} index={index} />
      ))}
    </motion.div>
  )
}

const PostCard = ({ post, index }) => {
  const hasImage = post.image && post.image.trim() !== ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>

          {hasImage && (
            <div className="flex items-center text-blue-500 dark:text-blue-400">
              <Image size={14} />
            </div>
          )}
        </div>

        <p className="text-gray-800 dark:text-gray-200 text-sm mb-3">{post.text}</p>

        {hasImage && (
          <div className="mt-3 mb-3 rounded-lg overflow-hidden">
            <img
              src={post.image || "/placeholder.svg"}
              alt="Post attachment"
              className="w-full h-auto max-h-64 object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
              <Heart size={14} className={post.likes?.includes(post.user._id) ? "text-red-500 fill-red-500" : ""} />
              <span>{post.likes?.length || 0}</span>
            </div>

            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
              <MessageCircle size={14} />
              <span>{post.comments?.length || 0}</span>
            </div>
          </div>

          {/* <a href={`/posts/${post._id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            View Details
          </a> */}
        </div>
      </div>
    </motion.div>
  )
}

export default PostsList

