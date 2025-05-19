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

const { Header, Sider, Content } = Layout;
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
        snapshot.exists() ? setAdminData(snapshot.val()) : navigate('/admin');
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
    { 
      key: 'dashboard', 
      icon: <DashboardOutlined />, 
      label: 'Dashboard',
      onClick: () => navigate(`/admin/${adminId}/dashboard`)
    },
    { 
      key: 'posts', 
      icon: <FileOutlined />, 
      label: 'Posts',
      onClick: () => navigate(`/admin/${adminId}/posts`)
    },
    { 
      key: 'settings', 
      icon: <SettingOutlined />, 
      label: 'Settings',
      onClick: () => navigate(`/admin/${adminId}/settings`)
    },
    { 
      key: 'logout', 
      icon: <LogoutOutlined />, 
      label: 'Logout',
      onClick: handleLogout,
      danger: true
    }
  ];

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          width={250}
          className="bg-white shadow-md fixed left-0 h-full z-10"
          theme="light"
        >
          <div className="p-4 h-16 flex items-center justify-center border-b">
            <Title level={4} className="m-0 text-blue-600">
              School Bulletin
            </Title>
          </div>
          <Menu
            mode="inline"
            items={menuItems}
            className="mt-2"
          />
        </Sider>
      )}

      <Layout className={!isMobile ? "ml-[250px]" : ""}>
        <Header className="bg-white px-4 flex items-center justify-between shadow-sm">
          {isMobile ? (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setDrawerVisible(true)}
              className="text-lg"
            />
          ) : (
            <div className="flex-1" /> // Spacer for desktop layout
          )}
          
          <div className="flex items-center gap-2">
            <Avatar 
              size="default" 
              src={adminData?.photoURL} 
              className="bg-blue-500"
            />
            <span className="hidden md:inline">
              {adminData?.displayName || adminData?.email || 'Admin'}
            </span>
          </div>
        </Header>

        {/* Mobile Drawer */}
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={250}
          bodyStyle={{ padding: 0 }}
        >
          <div className="p-4 h-16 flex items-center justify-center border-b">
            <Title level={4} className="m-0 text-blue-600">
              School Bulletin
            </Title>
          </div>
          <Menu
            mode="inline"
            items={menuItems}
            className="mt-2"
          />
        </Drawer>

        <Content className="p-4 md:p-6 bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;