import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Row, 
  Col, 
  Statistic, 
  Grid, 
  Modal, 
  Typography, 
  Image,
  Button 
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const { adminId } = useParams();
  const [stats, setStats] = useState({
    pendingPosts: 0,
    approvedPosts: 0
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const screens = useBreakpoint();

  const pendingPosts = [
    { 
      id: 1, 
      title: 'Math Club Meeting', 
      content: 'Annual math club meeting discussing upcoming competitions and schedule changes.',
      author: 'John Doe', 
      date: '2024-03-20',
      imageUrl: 'https://placehold.co/600x400'
    },
    { 
      id: 2, 
      title: 'Sports Day Update', 
      content: 'Important updates about the annual sports day events and new activities.',
      author: 'Jane Smith', 
      date: '2024-03-19',
      imageUrl: 'https://placehold.co/600x400'
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStats({
        pendingPosts: pendingPosts.length,
        approvedPosts: 3
      });
      setLoading(false);
    }, 1000);
  }, [adminId]);

  const handleRowClick = (record) => {
    setSelectedPost(record);
    setModalVisible(true);
  };

  const handleApprove = () => {
    console.log('Approved:', selectedPost);
    setModalVisible(false);
  };

  const handleReject = () => {
    console.log('Rejected:', selectedPost);
    setModalVisible(false);
  };

  const columns = [
    { 
      title: 'Title', 
      dataIndex: 'title', 
      key: 'title',
      render: (text, record) => (
        screens.xs ? (
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">
              {record.author} • {record.date}
            </div>
          </div>
        ) : (
          <div className="font-medium">{text}</div>
        )
      ),
      ellipsis: true
    },
    { 
      title: 'Author', 
      dataIndex: 'author', 
      key: 'author',
      responsive: ['sm'],
      ellipsis: true
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date',
      responsive: ['sm'],
      ellipsis: true
    }
  ];

  return (
    <div className="p-4">
      {/* Detail Modal */}
      <Modal
        title="Post Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="reject" danger onClick={handleReject}>
            Reject
          </Button>,
          <Button key="approve" type="primary" onClick={handleApprove}>
            Approve
          </Button>
        ]}
        width={screens.md ? 800 : '90%'}
      >
        {selectedPost && (
          <div className="space-y-4">
            <Title level={4}>{selectedPost.title}</Title>
            
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Text strong>Author:</Text>
                <Text>{selectedPost.author}</Text>
              </div>
              
              <div className="flex items-center gap-2">
                <Text strong>Date:</Text>
                <Text>{selectedPost.date}</Text>
              </div>
            </div>

            <div className="space-y-2">
              <Text strong>Content:</Text>
              <Text className="block whitespace-pre-wrap">
                {selectedPost.content}
              </Text>
            </div>

            {selectedPost.imageUrl && (
              <Image
                src={selectedPost.imageUrl}
                alt="Post attachment"
                className="border rounded-lg"
                preview={false}
                style={{
                  maxWidth: '100%',
                  height: screens.md ? 300 : 200,
                  objectFit: 'cover'
                }}
              />
            )}
          </div>
        )}
      </Modal>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card className="shadow-sm">
            <Statistic
              title="Pending Posts"
              value={stats.pendingPosts}
              prefix={<FileTextOutlined className="text-orange-500" />}
              loading={loading}
              valueStyle={{ fontSize: screens.md ? 24 : 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="shadow-sm">
            <Statistic
              title="Approved Posts"
              value={stats.approvedPosts}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              loading={loading}
              valueStyle={{ fontSize: screens.md ? 24 : 20 }}
            />
          </Card>
        </Col>
      </Row>
        {/* Responsive Approvals Table */}
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-semibold">
          Pending Approvals
        </h2>
      </div>
      {/* Responsive Table */}
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
            showSizeChanger: screens.md,
            position: ['bottomRight']
          }}
          scroll={{ x: screens.xs ? 300 : false }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;