import React, { useState } from 'react';
import { Card, Input, Select, Tag, Row, Col, Empty } from 'antd';
// import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

const Home = () => {
  // Mock data - replace with your actual data source
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Math Competition Results',
      content: 'The annual math competition results will be announced on Friday in the auditorium.',
      category: 'Academic',
      priority: 'normal',
      date: '2024-03-15T09:00:00'
    },
    {
      id: 2,
      title: 'Sports Day Postponed',
      content: 'Due to weather conditions, sports day has been rescheduled to next week.',
      category: 'Sports',
      priority: 'urgent',
      date: '2024-03-14T15:30:00'
    },
    {
      id: 3,
      title: 'Art Club Exhibition',
      content: 'Visit our annual art exhibition in the school gallery this Wednesday.',
      category: 'Clubs',
      priority: 'normal',
      date: '2024-03-13T11:45:00'
    }
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
    <div className="p-4">
      {/* Search and Filter Section */}
      <div className="mb-6">
        {/* The Search component below will be removed */}
        {/* 
        <Search
          placeholder="Search announcements..."
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        /> 
        */}
        
        <div className="flex gap-4">
          <Select
            defaultValue="all"
            onChange={value => setSelectedCategory(value)}
            className="min-w-[150px]"
          >
            <Option value="all">All Categories</Option>
            <Option value="Academic">Academic</Option>
            <Option value="Sports">Sports</Option>
            <Option value="Clubs">Clubs</Option>
          </Select>

          <Select
            defaultValue="all"
            onChange={value => setSelectedPriority(value)}
            className="min-w-[150px]"
          >
            <Option value="all">All Priorities</Option>
            <Option value="normal">Normal</Option>
            <Option value="urgent">Urgent</Option>
          </Select>
        </div>
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <Empty
          description="No announcements found"
          className="mt-12"
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredPosts.map(post => (
            <Col key={post.id} xs={24} sm={12} lg={8} xl={6}>
              <Card
                title={post.title}
                extra={
                  <Tag color={post.priority === 'urgent' ? 'red' : 'blue'}>
                    {post.priority}
                  </Tag>
                }
                className="h-full shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-2">
                  <Tag color="geekblue">{post.category}</Tag>
                  <span className="text-gray-500 text-sm ml-2">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{post.content}</p>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Home;