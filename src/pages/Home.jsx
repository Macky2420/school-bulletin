import React, { useState, useEffect } from 'react';
import { Card, Select, Tag, Row, Col, Empty, Modal, Image, Spin, message, Input } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { ref, onValue, remove } from 'firebase/database';
import { realtimeDb } from '../database/firebaseConfig';
import { useParams } from 'react-router-dom';

const { Option } = Select;
const { Search } = Input;

const Home = () => {
  const { adminId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const approvedRef = ref(realtimeDb, 'approvedPosts');
    const unsubscribe = onValue(
      approvedRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        const list = Object.entries(data)
          .map(([id, post]) => ({ id, ...post }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading posts:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    try {
      await remove(ref(realtimeDb, `approvedPosts/${id}`));
      message.success('Post deleted');
    } catch (error) {
      message.error('Delete failed: ' + error.message);
    }
  };

  // Composite filtering
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || post.category === selectedCategory;
    const matchesPriority =
      selectedPriority === 'all' || post.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  if (loading) return <Spin className="mt-8" />;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Search Bar */}
      <div className="mb-4">
        <Search
          placeholder="Search posts"
          allowClear
          enterButton
          onSearch={(value) => setSearchQuery(value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 gap-4">
        <Select
          value={selectedCategory}
          onChange={setSelectedCategory}
          className="w-full sm:w-48"
          placeholder="Category"
        >
          <Option value="all">All Categories</Option>
          <Option value="Academic">Academic</Option>
          <Option value="Events">Events</Option>
          <Option value="General">General</Option>
        </Select>
        <Select
          value={selectedPriority}
          onChange={setSelectedPriority}
          className="w-full sm:w-48"
          placeholder="Priority"
        >
          <Option value="all">All Priorities</Option>
          <Option value="normal">Normal</Option>
          <Option value="urgent">Urgent</Option>
        </Select>
      </div>

      {filteredPosts.length === 0 ? (
        <Empty description="No announcements found" className="mt-16" />
      ) : (
        <Row gutter={[16, 16]} className="justify-center">
          {filteredPosts.map((post) => (
            <Col key={post.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() => setSelectedPost(post)}
                className="h-full flex flex-col justify-between relative"
                styles={{ body: { padding: 16 } }}
              >
                {adminId && (
                  <DeleteOutlined
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
                    }}
                    className="absolute top-1 right-1 text-red-500 text-base cursor-pointer"
                    style={{color: "red"}}
                  />
                )}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold leading-snug">
                      {post.title}
                    </h3>
                    <Tag
                      className="ml-2"
                      color={post.priority === 'urgent' ? 'red' : 'blue'}
                    >
                      {post.priority}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <Tag color="geekblue" className="uppercase text-xs">
                      {post.category}
                    </Tag>
                    <span className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={selectedPost?.title}
        open={!!selectedPost}
        onCancel={() => setSelectedPost(null)}
        footer={null}
        width={600}
        centered
      >
        {selectedPost && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Tag color="geekblue">{selectedPost.category}</Tag>
              <Tag color={selectedPost.priority === 'urgent' ? 'red' : 'blue'}>
                {selectedPost.priority}
              </Tag>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(selectedPost.createdAt).toLocaleString()}
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">
              {selectedPost.content}
            </p>
            {selectedPost.image && (
              <Image
                src={selectedPost.image}
                alt={selectedPost.title}
                className="rounded-lg mt-4"
                width="100%"
              />
            )}
            {selectedPost.files && (
              <div className="mt-4 space-y-2">
                {selectedPost.files.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.url}
                    download
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    📎 {file.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;
