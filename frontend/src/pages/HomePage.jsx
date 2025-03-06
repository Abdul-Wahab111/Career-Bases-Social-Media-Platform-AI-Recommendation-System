"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { User, Loader } from "lucide-react"
import Layout from "../components/Layout"
import PostCard from "../components/posts/PostCard"
import CreatePost from "../components/posts/CreatePost" // Added CreatePost component

const HomePage = () => {
  const [posts, setPosts] = useState([])
  const [following, setFollowing] = useState([])
  const [userId, setUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all") // "all" or "following"
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    try {
      if (token) {
        const decoded = jwtDecode(token)
        const id = decoded._id || decoded.id
        setUserId(id)
        fetchFollowing(id) // Fetch following list first
      } else {
        navigate("/login")
      }
    } catch (error) {
      console.error("Token decode error:", error)
      navigate("/login")
    }
  }, [navigate])

  const fetchFollowing = async (id) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`http://localhost:5000/api/users/${id}/following`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const followingData = response.data.data || []
      const followingIds = followingData.map((user) => user._id || user.id)
      setFollowing(followingIds)

      fetchPosts()
    } catch (error) {
      console.error("Error fetching following list:", error)
      fetchPosts()
    }
  }

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")

      const { data } = await axios.get("http://localhost:5000/api/posts/allposts", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!data || !Array.isArray(data)) {
        console.error("Unexpected data format:", data)
        setPosts([])
        return
      }

      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      console.error("Error details:", error.response?.data || error.message)
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts])
  }

  const handleFollowChange = (targetUserId, isNowFollowing) => {
    if (isNowFollowing) {
      setFollowing((prev) => [...prev, targetUserId])
    } else {
      setFollowing((prev) => prev.filter((id) => id !== targetUserId))
    }
  }

  const filteredPosts =
    activeFilter === "following" ? posts.filter((post) => following.includes(post.user?._id)) : posts

  const sortedPosts =
    activeFilter === "all"
      ? [...filteredPosts].sort((a, b) => {
          const aIsFollowing = following.includes(a.user?._id)
          const bIsFollowing = following.includes(b.user?._id)

          if (aIsFollowing && !bIsFollowing) return -1
          if (!aIsFollowing && bIsFollowing) return 1
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
      : filteredPosts

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {/* Create Post Section */}
        <div className="mb-6">
          <CreatePost userId={userId} fetchPosts={fetchPosts} />
        </div>
        {/* Filter Options */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-all">
          <div className="text-lg font-semibold mb-3 sm:mb-0 text-gray-800 dark:text-gray-200">Posts Feed</div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setActiveFilter("following")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === "following"
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Following
            </button>
          </div>
        </div>

        {/* Posts Section */}
        <div className="space-y-6">
          {isLoading && posts.length === 0 ? (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all">
              <div className="flex items-center justify-center">
                <Loader className="h-10 w-10 text-blue-500 animate-spin" />
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your feed...</p>
            </div>
          ) : sortedPosts.length > 0 ? (
            sortedPosts.map((post) => (
              <div key={post._id} className="transform transition-all duration-200 hover:scale-[1.01] hover:shadow-md">
                <PostCard
                  post={post}
                  userId={userId}
                  onPostUpdate={setPosts}
                  following={following}
                  onFollowChange={handleFollowChange}
                  isLoading={isLoading}
                />
              </div>
            ))
          ) : (
            <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm transition-all">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <User size={40} className="text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {activeFilter === "following" ? "No posts from people you follow" : "No posts available"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {activeFilter === "following"
                  ? "You aren't following anyone yet or the people you follow haven't posted. Try switching to 'All Posts' to discover users."
                  : "Be the first to share something with the community!"}
              </p>
            </div>
          )}
        </div>

        {/* Load More Button - Optional */}
        {sortedPosts.length > 10 && !isLoading && (
          <div className="mt-8 text-center">
            <button className="px-6 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium text-sm">
              Load More
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default HomePage

