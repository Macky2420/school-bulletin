import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Button, Row, Col, Statistic, Grid } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { useBreakpoint } = Grid;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const { adminId } = useParams();
  const [stats, setStats] = useState({
    pendingPosts: 0,
    approvedPosts: 0
  });
  const screens = useBreakpoint();

  // Mock data - replace with actual data from your backend
  const pendingPosts = [
    { id: 1, title: 'Math Club Meeting', category: 'Academic', author: 'John Doe', date: '2024-03-20' },
    { id: 2, title: 'Sports Day Update', category: 'Sports', author: 'Jane Smith', date: '2024-03-19' }
  ];

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    
    setTimeout(() => {
      setStats({
        pendingPosts: pendingPosts.length,
        approvedPosts: 3
      });
      setLoading(false);
    }, 1000);
  }, [adminId]);

  const columns = [
    { 
      title: 'Title', 
      dataIndex: 'title', 
      key: 'title',
      responsive: ['md']
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category',
      render: category => <Tag color="blue">{category}</Tag>,
      responsive: ['sm']
    },
    { 
      title: 'Author', 
      dataIndex: 'author', 
      key: 'author',
      responsive: ['md']
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date',
      responsive: ['lg']
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<CheckCircleOutlined />}
            className={!screens.md ? '!px-2' : ''}
          >
            {screens.md && 'Approve'}
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<CloseCircleOutlined />}
            className={!screens.md ? '!px-2' : ''}
          >
            {screens.md && 'Reject'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="p-4">
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card bordered={false} className="h-full shadow-sm">
            <Statistic
              title="Pending Posts"
              value={stats.pendingPosts}
              prefix={<FileTextOutlined className={`${screens.md ? 'text-xl' : 'text-lg'} text-orange-500 mr-2`} />}
              loading={loading}
              valueStyle={{ fontSize: screens.md ? 24 : 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} className="h-full shadow-sm">
            <Statistic
              title="Approved Posts"
              value={stats.approvedPosts}
              prefix={<CheckCircleOutlined className={`${screens.md ? 'text-xl' : 'text-lg'} text-green-500 mr-2`} />}
              loading={loading}
              valueStyle={{ fontSize: screens.md ? 24 : 20 }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mb-4">
        <h2 className={`${screens.md ? 'text-xl' : 'text-lg'} font-semibold`}>
          Pending Approvals
        </h2>
      </div>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={pendingPosts}
          rowKey="id"
          size={screens.md ? 'middle' : 'small'}
          loading={loading}
          pagination={{ 
            pageSize: 5,
            simple: !screens.md,
            showSizeChanger: screens.md
          }}
          scroll={{ x: screens.md ? false : 600 }}
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;