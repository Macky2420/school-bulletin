import React, { useEffect, useState } from 'react';
import { Layout, Menu, Typography, Avatar, Button, Grid, Drawer } from 'antd';
import { 
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileOutlined,
  SettingOutlined,
  LogoutOutlined 
} from '@ant-design/icons';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { auth, realtimeDb } from '../database/firebaseConfig';
import { ref, get } from 'firebase/database';
import { signOut } from 'firebase/auth';

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;
const { Title } = Typography;

const AdminLayout = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { adminId } = useParams();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAdminId = localStorage.getItem('adminId');
        if (!storedAdminId || storedAdminId !== adminId) {
          navigate('/admin');
          return;
        }

        const adminRef = ref(realtimeDb, `users/${adminId}`);
        const snapshot = await get(adminRef);
        if (snapshot.exists()) setAdminData(snapshot.val());
        else navigate('/admin');
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [adminId, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('adminId');
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', onClick: () => navigate(`/admin/${adminId}/dashboard`) },
    { key: 'posts',     icon: <FileOutlined />,      label: 'Posts',     onClick: () => navigate(`/admin/${adminId}/posts`) },
    { key: 'settings',  icon: <SettingOutlined />,   label: 'Settings',  onClick: () => navigate(`/admin/${adminId}/settings`) },
    { key: 'logout',    icon: <LogoutOutlined />,    label: 'Logout',    onClick: handleLogout, danger: true }
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-4 shadow sticky top-0 z-50 h-16 relative flex items-center">
        {/* Logo (left) */}
        <div className="flex items-center gap-4">
          <Title level={4} className="m-0 text-blue-600 hidden sm:block">School Bulletin</Title>
          <Title level={5} className="m-0 text-blue-600 sm:hidden">SB</Title>
        </div>

        {/* Centered Menu (desktop only) */}
        {!isMobile && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Menu
              mode="horizontal"
              items={menuItems}
              className="border-0"
              overflowedIndicator={null}
              style={{ whiteSpace: 'nowrap', lineHeight: '64px' }}
            />
          </div>
        )}

        {/* Avatar & Menu Button (right) */}
        <div className="ml-auto flex items-center gap-4">
          {isMobile && (
            <Button
              type="text"
              icon={drawerVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setDrawerVisible(prev => !prev)}
              className="text-xl"
            />
          )}
          <Avatar size={screens.xs ? 'small' : 'default'} src={adminData?.photoURL} className="bg-blue-500" />
          <span className="hidden sm:inline text-sm md:text-base">{adminData?.displayName || adminData?.email || 'Admin'}</span>
        </div>
      </Header>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title={(
            <div className="flex items-center gap-2">
              <Avatar size="small" src={adminData?.photoURL} className="bg-blue-500" />
              <span>{adminData?.displayName || adminData?.email || 'Admin'}</span>
            </div>
          )}
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={240}
          bodyStyle={{ padding: 0 }}
        >
          <div className="p-4 border-b">
            <Title level={4} className="m-0 text-blue-600">School Bulletin</Title>
          </div>
          <Menu mode="inline" items={menuItems} selectedKeys={[]} style={{ borderRight: 0 }} />
        </Drawer>
      )}

      <Content className="p-4 bg-gray-50">
        <div className="max-w-7xl mx-auto"><Outlet /></div>
      </Content>
    </Layout>
  );
};

export default AdminLayout;
