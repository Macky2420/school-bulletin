import React, { useState } from 'react';
import { Card, Select, Tag, Row, Col, Empty, Modal, Image } from 'antd';

const { Option } = Select;

const Home = () => {
  // Dummy data
  const [posts] = useState([
    { 
      id: 1, 
      title: 'Event Update', 
      content: 'School event rescheduled to next Friday', 
      category: 'Events', 
      priority: 'normal', 
      date: '2024-03-15',
      image: 'https://picsum.photos/600/400?random=1'
    },
    { 
      id: 2, 
      title: 'URGENT: System Maintenance', 
      content: 'Portal will be offline tonight 10PM-12AM', 
      category: 'General', 
      priority: 'urgent', 
      date: '2024-03-14',
      image: 'https://picsum.photos/600/400?random=2'
    },
    { 
      id: 3, 
      title: 'New Course Available', 
      content: 'Introduction to AI starting next month', 
      category: 'Academic', 
      priority: 'normal', 
      date: '2024-03-13',
      files: [
        { name: 'Course Outline.pdf', url: '#' }
      ]
    },
  ]);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null); // Correctly initialized

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || post.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  return (
    <div className="p-2 md:p-4 lg:p-6">
      {/* Search and Filters */}
      <div className="mb-4 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            defaultValue="all"
            onChange={setSelectedCategory}
            className="w-full sm:w-1/2 lg:w-1/4"
          >
            <Option value="all">All Categories</Option>
            <Option value="Academic">Academic</Option>
            <Option value="Events">Events</Option>
            <Option value="General">General</Option>
          </Select>

          <Select
            defaultValue="all"
            onChange={setSelectedPriority}
            className="w-full sm:w-1/2 lg:w-1/4"
          >
            <Option value="all">All Priorities</Option>
            <Option value="normal">Normal</Option>
            <Option value="urgent">Urgent</Option>
          </Select>
        </div>
      </div>

      {/* Announcements Grid */}
      {filteredPosts.length === 0 ? (
        <Empty description="No announcements found" className="mt-8" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredPosts.map(post => (
            <Col key={post.id} xs={24} sm={12} md={12} lg={8} xl={6}>
              <Card
                title={
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-medium flex-1 min-w-0 whitespace-normal">
                      {post.title}
                    </h3>
                    <Tag color={post.priority === 'urgent' ? 'red' : 'blue'}>
                      {post.priority}
                    </Tag>
                  </div>
                }
                className="h-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                bodyStyle={{ padding: '12px' }}
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <Tag color="geekblue">{post.category}</Tag>
                    <span className="text-gray-500 text-sm">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Detail Modal */}
      <Modal
        title={selectedPost?.title}
        open={!!selectedPost}
        onCancel={() => setSelectedPost(null)}
        footer={null}
        width={800}
      >
        {selectedPost && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium text-gray-600">Category:</div>
                <Tag color="geekblue">{selectedPost.category}</Tag>
              </div>
              <div>
                <div className="font-medium text-gray-600">Priority:</div>
                <Tag color={selectedPost.priority === 'urgent' ? 'red' : 'blue'}>
                  {selectedPost.priority}
                </Tag>
              </div>
              <div>
                <div className="font-medium text-gray-600">Date:</div>
                <div>{new Date(selectedPost.date).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="font-medium text-gray-600 mb-2">Content:</div>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
            </div>

            {selectedPost.files && selectedPost.files.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <div className="font-medium text-gray-600 mb-2">Attachments:</div>
                <div className="space-y-2">
                  {selectedPost.files.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                      download
                    >
                      <span className="mr-2">📎</span>
                      {file.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedPost.image && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="font-medium text-gray-600 mb-2">Image:</div>
                <Image
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Home;