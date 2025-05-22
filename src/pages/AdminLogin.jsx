import React, { useState } from 'react';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, Alert, Card, Typography, Layout, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../database/firebaseConfig';

const { Title } = Typography;
const { Content } = Layout;

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Attempt login, return user object on success or null on failure
  const loginWithFirebase = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      if (['auth/invalid-credential', 'auth/user-not-found','auth/wrong-password'].includes(err.code)) {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Account temporarily locked due to too many failed login attempts.');
      } else {
        setError(`Login failed: ${err.message}`);
      }
      return null;
    }
  };

  const handleSubmit = async ({ email, password }) => {
    setLoading(true);
    setError('');
    const user = await loginWithFirebase(email, password);
    setLoading(false);

    if (user) {
      // For development: Skip admin check if using a test account
      if (process.env.NODE_ENV === 'development' && email.includes('test')) {
        messageApi.success('Development login successful!');
        console.log('Development admin login');
        localStorage.setItem('adminId', user.uid);
        navigate(`/admin/${user.uid}`, { replace: true });
        return;
      }

      // For production deployments: allow all authenticated users
      if (process.env.NODE_ENV === 'deployment') {
        messageApi.warning('Deployment mode: skipping admin verification.');
        console.log('Deployment admin login');
        localStorage.setItem('adminId', user.uid);
        navigate(`/admin/${user.uid}`, { replace: true });
        return;
      }

      // Normal login flow
      messageApi.success('Login successful!');
      navigate(`/admin/${user.uid}`, { replace: true });
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {contextHolder}
      <Content className="flex items-center justify-center p-4 w-full h-full">
        <div className="w-full max-w-[400px] px-4">
          <Card className="shadow-xl rounded-xl border-0">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <Title level={2} className="!mb-2 !text-2xl sm:!text-3xl">
                  <span className="text-blue-600">School Bulletin</span> Admin
                </Title>
                <p className="text-gray-600 text-sm sm:text-base">
                  Enter your credentials to continue
                </p>
              </div>

              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  className="mb-4"
                  closable
                  onClose={() => setError('')}
                />
              )}

              <Form
                form={form}
                name="login"
                onFinish={handleSubmit}
                layout="vertical"
                className="w-full"
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />} 
                    placeholder="admin@school.edu"
                    size="large"
                    className="!rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />} 
                    placeholder="••••••••"
                    size="large"
                    className="!rounded-lg"
                  />
                </Form.Item>

                <Form.Item className="!mt-8">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    className="!rounded-lg h-12 font-semibold"
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminLogin;
