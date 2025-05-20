import React, { useState } from 'react';
import { Card, Input, Select, Tag, Row, Col, Empty } from 'antd';

const { Option } = Select;

const Home = () => {
  // Simplified dummy data
  const [posts] = useState([
    { id: 1, title: 'Event Update', content: 'School event rescheduled to next Friday', category: 'Events', priority: 'normal', date: '2024-03-15' },
    { id: 2, title: 'URGENT: System Maintenance', content: 'Portal will be offline tonight 10PM-12AM', category: 'General', priority: 'urgent', date: '2024-03-14' },
    { id: 3, title: 'New Course Available', content: 'Introduction to AI starting next month', category: 'Academic', priority: 'normal', date: '2024-03-13' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

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
        <Input
          placeholder="Search announcements..."
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        
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
                className="h-full shadow-sm hover:shadow-md transition-shadow"
                bodyStyle={{ padding: '12px' }}
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-medium line-clamp-1 flex-1">
                      {post.title}
                    </h3>
                    <Tag color={post.priority === 'urgent' ? 'red' : 'blue'} className="flex-shrink-0">
                      {post.priority}
                    </Tag>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag color="geekblue">{post.category}</Tag>
                    <span className="text-gray-500 text-sm">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 line-clamp-3">{post.content}</p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Home;