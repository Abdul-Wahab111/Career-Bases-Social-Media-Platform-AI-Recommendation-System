"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"

export const useUserProfile = (userId) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const token = localStorage.getItem("token")

  const fetchUserData = useCallback(async () => {
    if (!userId || !token) {
      setError("Invalid user ID or not authenticated")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Get current user info
      const currentUserResponse = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCurrentUser(currentUserResponse.data)

      // Check if viewing own profile
      const isOwnProfile = currentUserResponse.data._id === userId

      // Get user info
      const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(userResponse.data)

      // Check if following this user
      if (currentUserResponse.data.following && !isOwnProfile) {
        setIsFollowing(currentUserResponse.data.following.includes(userId))
      }

      // Get profile info
      try {
        const profileResponse = await axios.get(`http://localhost:5000/api/profiles/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setProfile(profileResponse.data)
      } catch (profileError) {
        console.log("No profile found for this user")
        // Not setting error here as the user might not have a profile
      }

      // Get user's posts
      try {
        const postsResponse = await axios.get(`http://localhost:5000/api/posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setPosts(postsResponse.data)
      } catch (postsError) {
        console.log("Error fetching user posts:", postsError)
        // Not setting error here as the user might not have posts
      }

      // Get followers
      try {
        const followersResponse = await axios.get(`http://localhost:5000/api/users/${userId}/followers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setFollowers(followersResponse.data.data || [])
      } catch (followersError) {
        console.log("Error fetching followers:", followersError)
        setFollowers([])
      }

      // Get following
      try {
        const followingResponse = await axios.get(`http://localhost:5000/api/users/${userId}/following`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setFollowing(followingResponse.data.data || [])
      } catch (followingError) {
        console.log("Error fetching following:", followingError)
        setFollowing([])
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError(err.response?.data?.message || "Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }, [userId, token])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const handleFollow = async () => {
    if (isFollowLoading || !user) return

    setIsFollowLoading(true)
    try {
      if (isFollowing) {
        // Unfollow
        await axios.post(
          `http://localhost:5000/api/users/unfollow/${userId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        setIsFollowing(false)
        setFollowers((prev) => prev.filter((follower) => follower._id !== currentUser._id))
      } else {
        // Follow
        await axios.post(
          `http://localhost:5000/api/users/follow/${userId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )
        setIsFollowing(true)
        setFollowers((prev) => [...prev, currentUser])
      }
    } catch (error) {
      console.error("Error updating follow status:", error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  return {
    user,
    profile,
    posts,
    followers,
    following,
    isLoading,
    error,
    currentUser,
    isFollowing,
    isFollowLoading,
    handleFollow,
    fetchUserData,
  }
}

