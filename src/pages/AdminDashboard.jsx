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
  Button,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { ref, onValue, push, remove } from 'firebase/database';
import { realtimeDb } from '../database/firebaseConfig';
import { useParams } from 'react-router-dom';

const { useBreakpoint } = Grid;
const { Text } = Typography;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const { adminId } = useParams();

  const [pendingPosts, setPendingPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [stats, setStats] = useState({ pendingPosts: 0, approvedPosts: 0 });
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const screens = useBreakpoint();

  useEffect(() => {
    setLoading(true);
    const pendingRef = ref(realtimeDb, 'pendingPosts');
    const approvedRef = ref(realtimeDb, 'approvedPosts');

    const unsubscribePending = onValue(
      pendingRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        const list = Object.entries(data)
          .map(([id, post]) => ({ id, ...post }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPendingPosts(list);
        setStats((prev) => ({ ...prev, pendingPosts: list.length }));
      },
      (error) => {
        message.error('Failed to load pending posts: ' + error.message);
      }
    );

    const unsubscribeApproved = onValue(
      approvedRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        const list = Object.entries(data)
          .map(([id, post]) => ({ id, ...post }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setApprovedPosts(list);
        setStats((prev) => ({ ...prev, approvedPosts: list.length }));
        setLoading(false);
      },
      (error) => {
        message.error('Failed to load approved posts: ' + error.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribePending();
      unsubscribeApproved();
    };
  }, [adminId]);

  const handleRowClick = (record) => {
    setSelectedPost(record);
    setModalVisible(true);
  };

  const handleApprove = async () => {
    try {
      const { id, ...postData } = selectedPost;
      const approvedRef = ref(realtimeDb, 'approvedPosts');
      await push(approvedRef, { ...postData, status: 'approved' });
      const pendingItemRef = ref(realtimeDb, `pendingPosts/${id}`);
      await remove(pendingItemRef);
      message.success('Post approved!');
    } catch (error) {
      message.error('Approve failed: ' + error.message);
    } finally {
      setModalVisible(false);
    }
  };

  const handleReject = async () => {
    try {
      const pendingItemRef = ref(realtimeDb, `pendingPosts/${selectedPost.id}`);
      await remove(pendingItemRef);
      message.error('Post rejected and removed');
    } catch (error) {
      message.error('Reject failed: ' + error.message);
    } finally {
      setModalVisible(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) =>
        screens.xs ? (
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">
              {record.author} • {new Date(record.createdAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="font-medium">{text}</div>
        ),
      ellipsis: true,
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      responsive: ['sm'],
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      responsive: ['sm'],
      ellipsis: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-4">
      <Modal
        title={<span className="text-lg font-medium">Post Details</span>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={
          <div className="flex flex-col md:flex-row gap-2 justify-end">
            <Button
              danger
              onClick={handleReject}
              className="md:order-1"
              block={!screens.md}
            >
              <CloseCircleOutlined /> Reject
            </Button>
            <Button
              type="primary"
              onClick={handleApprove}
              block={!screens.md}
            >
              <CheckCircleOutlined /> Approve
            </Button>
          </div>
        }
        width={screens.md ? 800 : '90%'}
        className="[&_.ant-modal-close]:hover:text-gray-400"
      >
        {selectedPost && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedPost.title}
              </h3>
              <div className="flex flex-col space-y-1 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <UserOutlined className="text-gray-400" />
                  <span>{selectedPost.author}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarOutlined className="text-gray-400" />
                  <span>
                    {new Date(
                      selectedPost.createdAt
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {selectedPost.content && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Content</div>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {selectedPost.content}
                </p>
              </div>
            )}

            {selectedPost.image && (
              <div className="border rounded-lg overflow-hidden">
                <Image
                  src={selectedPost.image}
                  alt="Post attachment"
                  preview={{
                    maskClassName: 'rounded-lg',
                    mask: <span className="text-sm">Click to Preview</span>,
                  }}
                  className="w-full h-auto object-contain bg-gray-50"
                  style={{ maxHeight: '60vh' }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

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

      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-semibold">
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
            showSizeChanger: screens.md,
            position: ['bottomRight'],
          }}
          scroll={{ x: screens.xs ? 300 : false }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;