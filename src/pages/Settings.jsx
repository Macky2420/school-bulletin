import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Modal, Grid, Avatar, Typography, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, get, update } from 'firebase/database';
import { realtimeDb } from '../database/firebaseConfig';
import { getAuth, updatePassword, signOut } from 'firebase/auth';

const { useBreakpoint } = Grid;
const { Text } = Typography;

const Settings = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const { adminId } = useParams();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const adminRef = ref(realtimeDb, `users/${adminId}`);
        const snapshot = await get(adminRef);
        if (snapshot.exists()) {
          setAdminData(snapshot.val());
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [adminId]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    try {
      setUpdating(true);
      const user = auth.currentUser;
      
      if (!user) {
        message.error('No authenticated user found');
        return;
      }

      await updatePassword(user, values.newPassword);
      
      const adminRef = ref(realtimeDb, `users/${adminId}`);
      await update(adminRef, {
        lastPasswordChange: new Date().toISOString()
      });

      message.success('Password updated successfully. Please log in again.');
      await signOut(auth);
      navigate('/admin');
      
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/requires-recent-login') {
        message.error('Please log out and log in again before changing your password');
      } else {
        message.error('Failed to update password. Please try again.');
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-4">
      <Card 
        title="Admin Settings" 
        className="shadow-sm"
        style={{ maxWidth: 800, margin: '0 auto' }}
      >
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="border-b pb-6">
            <h3 className={`${screens.md ? 'text-lg' : 'text-base'} font-semibold mb-4`}>
              Profile Information
            </h3>
            <div className="flex items-center gap-4">
              <Avatar 
                size={screens.md ? 64 : 48} 
                icon={<UserOutlined />}
                className="bg-blue-500"
              />
              <div>
                <div className="font-medium text-base md:text-lg">
                  {adminData?.displayName || 'Admin User'}
                </div>
                <div className="text-gray-500 text-sm md:text-base">
                  {adminData?.email || 'No email available'}
                </div>
                {adminData?.lastLogin && (
                  <div className="text-gray-400 text-xs md:text-sm mt-1">
                    Last login: {new Date(adminData.lastLogin).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div>
            <h3 className={`${screens.md ? 'text-lg' : 'text-base'} font-semibold mb-2`}>
              Account Security
            </h3>
            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={showModal}
              size={screens.md ? 'middle' : 'small'}
            >
              Change Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Password Change Modal */}
      <Modal
        title="Change Password"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        width={screens.md ? 500 : '90%'}
      >
        <Form
          form={form}
          name="change_password"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              placeholder="Enter new password (minimum 6 characters)"
              size={screens.md ? 'large' : 'middle'}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm new password"
              size={screens.md ? 'large' : 'middle'}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={handleCancel} disabled={updating}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={updating}
            >
              Update Password
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;