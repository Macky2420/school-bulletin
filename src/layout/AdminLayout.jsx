import React, { useEffect, useState } from 'react';
import { Layout, Menu, Typography, Avatar, Button, Grid, Drawer } from 'antd';
import { 
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileOutlined,
  SettingOutlined,
  LogoutOutlined,
  BulbOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
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
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();
  const { adminId } = useParams();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

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

  useEffect(() => {
    // Set active menu item based on current route
    const path = location.pathname;
    if (path.includes('home')) setSelectedKey('posts');
    else if (path.includes('setting')) setSelectedKey('settings');
    else setSelectedKey('dashboard');
  }, [location]);

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
      onClick: () => navigate(`/admin/${adminId}`) 
    },
    { 
      key: 'posts',     
      icon: <FileOutlined />,      
      label: 'Posts',     
      onClick: () => navigate(`/home/${adminId}`) 
    },
    { 
      key: 'settings',  
      icon: <SettingOutlined />,   
      label: 'Settings',  
      onClick: () => navigate(`/setting/${adminId}`) 
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
      <Header className="bg-white px-4 shadow top-0 z-50 h-16 relative flex items-center" style={{ padding: '0 10px' }}>
        {/* Logo (left) */}
        <Link to={`/admin/${adminId}`} className="flex items-center">
            <BulbOutlined className="text-blue-600 text-xl mr-2" />
            <span className="text-base md:text-base font-semibold">School Bulletin</span>
        </Link>

        {/* Centered Menu (desktop only - hidden on tablet) */}
        {!isMobile && !isTablet && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Menu
              mode="horizontal"
              selectedKeys={[selectedKey]}
              items={menuItems}
              className="border-0"
              style={{ 
                lineHeight: '64px',
                display: 'flex',
                justifyContent: 'center',
                gap: '24px'
              }}
            />
          </div>
        )}

        {/* Avatar & Menu Button (right) */}
        <div className="ml-auto flex items-center gap-4">
          {(isMobile || isTablet) && (
            <Button
              type="text"
              icon={drawerVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              onClick={() => setDrawerVisible(prev => !prev)}
              className="text-xl"
              style={{color: "white"}}
            />
          )}
          <div className="hidden lg:flex items-center gap-4">
            <Avatar 
              size={screens.xs ? 'small' : 'default'} 
              src={adminData?.photoURL} 
              className="bg-blue-500"
              icon={<UserOutlined />}
            />
            <span className="text-sm md:text-base text-white">
              {adminData?.displayName || adminData?.email || 'Admin'}
            </span>
          </div>
        </div>
      </Header>

      {/* Mobile & Tablet Drawer */}
      {(isMobile || isTablet) && (
        <Drawer
          title={(
            <div className="flex items-center gap-3 py-2">
              <Avatar 
                size="large" 
                src={adminData?.photoURL} 
                className="bg-blue-500 border-2 border-blue-100"
                icon={<UserOutlined />}
              />
              <div className="flex flex-col">
                <span className="font-medium text-base text-white">
                  {adminData?.displayName || adminData?.email || 'Admin'}
                </span>
                <span className="text-gray-300 text-sm">Administrator</span>
              </div>
            </div>
          )}
          placement="right"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={280}
          styles={{
            header: { 
              padding: '16px',
              borderBottom: '1px solid #f0f0f0'
            },
            body: { 
              padding: 0,
              background: '#fafafa'
            }
          }}
        >
          <div className="p-4 bg-white border-b">
            <Title level={4} className="m-0 text-blue-600 flex items-center gap-2">
              <BulbOutlined />
              School Bulletin
            </Title>
          </div>

          <Menu 
            mode="inline" 
            items={menuItems} 
            selectedKeys={[selectedKey]}
            style={{ 
              borderRight: 0,
              background: 'transparent'
            }}
            className="px-2 py-2"
          />

          <div className="absolute bottom-0 w-full p-4 bg-white border-t">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} School Bulletin
            </div>
          </div>
        </Drawer>
      )}

      <Content className="p-4 bg-gray-50">
        <div className="max-w-7xl mx-auto"><Outlet /></div>
      </Content>

      <style>{`
        .ant-menu-horizontal {
          border-bottom: none !important;
        }
        .ant-menu-horizontal > .ant-menu-item-selected {
          border-bottom: 2px solid #1890ff !important;
          color: #1890ff !important;
        }
        .ant-menu-horizontal > .ant-menu-item:hover {
          border-bottom: 2px solid #1890ff !important;
          color: #1890ff !important;
        }
        .ant-menu-inline .ant-menu-item-selected::after {
          border-right: 3px solid #1890ff !important;
        }
      `}</style>
    </Layout>
  );
};

export default AdminLayout;