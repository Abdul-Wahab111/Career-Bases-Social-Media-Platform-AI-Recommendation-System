import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import CreatePost from "../components/CreatePost";
import PostList from "../components/PostList";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        const decoded = jwtDecode(token);
        const id = decoded._id || decoded.id;
        setUserId(id);
      }
    } catch (error) {
      console.error("Token decode error:", error);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get("http://localhost:5000/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Posts fetched:", data);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <CreatePost userId={userId} fetchPosts={fetchPosts} />
        <PostList posts={posts} userId={userId} fetchPosts={fetchPosts} />
      </div>
    </Layout>
  );
};

export default Posts;