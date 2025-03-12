"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import Layout from "../components/Layout"
import ProfileHeader from "../components/user-profiling/ProfileHeader"
import ProfileTabs from "../components/user-profiling/ProfileTabs"
import ProfileContent from "../components/user-profiling/ProfileContent"
import LoadingState from "../components/user-profiling/LoadingState"
import ErrorState from "../components/user-profiling/ErrorState"
import NotFoundState from "../components/user-profiling/NotFoundState"
import { useUserProfile } from "../hooks/useUserProfile"

const UserProfile = () => {
  const { userId } = useParams()
  const {
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
  } = useUserProfile(userId)

  const [activeTab, setActiveTab] = useState("profile")

  // Refresh data when tab changes to ensure latest data
  useEffect(() => {
    if (activeTab === "followers" || activeTab === "following") {
      fetchUserData()
    }
  }, [activeTab, fetchUserData])

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} />
  }

  if (!user) {
    return <NotFoundState />
  }

  const isOwnProfile = currentUser && currentUser._id === userId

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <ProfileHeader
          user={user}
          profile={profile}
          postsCount={posts.length}
          followersCount={followers.length}
          followingCount={following.length}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          isFollowLoading={isFollowLoading}
          handleFollow={handleFollow}
        />

        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} isOwnProfile={isOwnProfile} />

        <ProfileContent
          activeTab={activeTab}
          profile={profile}
          posts={posts}
          followers={followers}
          following={following}
          isOwnProfile={isOwnProfile}
          currentUser={currentUser}
        />
      </div>
    </Layout>
  )
}

export default UserProfile

