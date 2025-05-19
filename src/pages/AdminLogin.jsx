import React, { useState } from 'react';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Form, Input, Alert, Card, Typography, Layout, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, realtimeDb } from '../database/firebaseConfig';
import { ref, get, set, serverTimestamp } from 'firebase/database';

const { Title } = Typography;
const { Content } = Layout;

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Function to store user data in Realtime Database
  const storeUserInDatabase = async (user) => {
    try {
      // Reference to the user's data
      const userRef = ref(realtimeDb, `users/${user.uid}`);
      
      // Check if user data already exists
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        // If user doesn't exist in the database, create a new entry
        await set(userRef, {
          email: user.email,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
        });
        console.log("New user added to database");
      } else {
        // Update the last login time
        await set(ref(realtimeDb, `users/${user.uid}/lastLogin`), serverTimestamp());
        console.log("User login time updated");
      }
      return true;
    } catch (error) {
      console.error("Error storing user data:", error);
      return false;
    }
  };

  const loginWithFirebase = async (email, password) => {
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store user in database regardless of admin status
      try {
        await storeUserInDatabase(user);
      } catch (storeError) {
        console.error("Failed to store user data, but continuing login:", storeError);
      }
      
      // For development: Skip admin check if we're using a test account
      if (process.env.NODE_ENV === 'development' && email.includes('test')) {
        messageApi.success('Development login successful!');
        console.log('Development admin login');
        
        // Store only the admin ID
        localStorage.setItem('adminId', user.uid);
        
        setTimeout(() => {
          navigate(`/admin/${user.uid}`);
        }, 500);
        return true;
      }
      
      try {
        // Check if user is an admin in the Realtime Database
        const adminRef = ref(realtimeDb, `admins/${user.uid}`);
        const adminSnapshot = await get(adminRef);
        
        if (adminSnapshot.exists()) {
          // User is an admin
          messageApi.success('Login successful!');
          console.log('Admin login successful');
          
          // Store only the admin ID
          localStorage.setItem('adminId', user.uid);
          
          setTimeout(() => {
            navigate(`/admin/${user.uid}`);
          }, 500);
          return true;
        } else {
          // User exists but is not an admin - for now, we'll allow access in development
          if (process.env.NODE_ENV === 'development') {
            messageApi.warning('Admin privileges not found but allowing access in development mode.');
            
            // Store only the admin ID
            localStorage.setItem('adminId', user.uid);
            
            setTimeout(() => {
              navigate(`/admin/${user.uid}`);
            }, 500);
            return true;
          } else {
            await auth.signOut();
            messageApi.error('Access denied. Not authorized as admin.');
            setError('You do not have admin privileges.');
            return false;
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        
        // In development, proceed anyway
        if (process.env.NODE_ENV === 'development') {
          messageApi.warning('Database check failed, but allowing access in development mode.');
          
          // Store only the admin ID
          localStorage.setItem('adminId', user.uid);
          
          setTimeout(() => {
            navigate(`/admin/${user.uid}`);
          }, 500);
          return true;
        } else {
          messageApi.error('Error verifying admin status.');
          setError('Error verifying your admin status. Please try again later.');
          return false;
        }
      }
    } catch (error) {
      console.error('Login error:', error.code, error.message);
      
      // Handle specific error cases
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        messageApi.error('Invalid email or password');
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        messageApi.error('Too many failed login attempts. Please try again later.');
        setError('Account temporarily locked due to too many failed login attempts.');
      } else {
        messageApi.error('Login failed');
        setError(`Login failed: ${error.message}`);
      }
      return false;
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError('');
      await loginWithFirebase(values.email, values.password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {contextHolder}
      <Content className="flex items-center justify-center p-4 w-full h-full">
        <div className="w-full max-w-[400px] px-4"> {/* Added horizontal padding container */}
          <Card 
            className="shadow-xl rounded-xl border-0"
          >
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
                
                <div className="text-center mt-4">
                  <Link 
                    to="/forgot-password" 
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </Form>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminLogin;