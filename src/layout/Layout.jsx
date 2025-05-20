import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Button, Input, Drawer, Space, Grid, Modal, Form, Select } from 'antd';
import { BulbOutlined, PlusOutlined, MenuOutlined, SearchOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;
const { Option } = Select;

const AppLayout = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const showModal = () => {
    setIsModalVisible(true);
    closeDrawer(); // Close drawer if open on mobile
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      console.log('Submitted values:', values);
      form.resetFields();
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  return (
    <Layout className="min-h-screen">
      {/* Header */}
      <Header style={{padding: '0px 10px'}} className="bg-white shadow-sm fixed w-full z-10">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <BulbOutlined className="text-blue-600 text-xl mr-2" />
            <span className="text-base md:text-lg font-semibold md:inline">School Bulletin</span>
          </Link>

          {/* Desktop Navigation */}
          {isDesktop && (
            <div className="flex items-center gap-6">
              <Input.Search
                placeholder="Search announcements..."
                onSearch={(value) => console.log('Search:', value)}
                className="w-96"
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                New Post
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          {!isDesktop && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={showDrawer}
              className="text-xl"
              style={{ color: 'white' }}
            />
          )}
        </div>
      </Header>

      {/* Mobile Drawer */}
      {!isDesktop && (
        <Drawer
          title="Menu"
          placement="right"
          onClose={closeDrawer}
          open={drawerVisible}
          width={300}
          styles={{ body: { padding: 16 } }}
        >
          <Space direction="vertical" className="w-full" size="middle">
            <Input.Search
              placeholder="Search announcements..."
              onSearch={(value) => {
                console.log('Mobile Search:', value);
                closeDrawer();
              }}
              enterButton="Search"
              prefix={<SearchOutlined />}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              block
              onClick={showModal}
            >
              Create New Post
            </Button>
          </Space>
        </Drawer>
      )}

      {/* Create Bulletin Modal */}
      <Modal
        title="Create New Bulletin"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Publish"
        cancelText="Cancel"
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-6">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter bulletin title" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: 'Please enter the content' }]}
          >
            <Input.TextArea rows={4} placeholder="Write your content here..." />
          </Form.Item>

          <Space className="w-full" size="large">
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select a category' }]}
              className="flex-grow"
            >
              <Select placeholder="Select category">
                <Option value="academic">Academic</Option>
                <Option value="sports">Sports</Option>
                <Option value="clubs">Clubs</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: 'Please select priority' }]}
              className="flex-grow"
            >
              <Select placeholder="Select priority">
                <Option value="normal">Normal</Option>
                <Option value="urgent">Urgent</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* Main Content */}
      <Content className="mt-16 container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 min-h-[calc(100vh-160px)]">
          <Outlet />
        </div>
      </Content>

      {/* Footer */}
      <Footer className="text-center bg-gray-100 py-6">
        <div className="container mx-auto">
          <Space direction="vertical" size="middle">
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} School Bulletin Board • All rights reserved
            </div>
          </Space>
        </div>
      </Footer>
    </Layout>
  );
};

export default AppLayout;