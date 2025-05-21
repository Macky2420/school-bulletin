import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { 
  Layout, 
  Button, 
  Input, 
  Drawer, 
  Space, 
  Grid, 
  Modal, 
  Form, 
  Select, 
  Upload 
} from 'antd';
import { 
  BulbOutlined, 
  PlusOutlined, 
  MenuOutlined, 
  SearchOutlined,
  UploadOutlined 
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;
const { Option } = Select;

const AppLayout = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  // Show/hide mobile drawer
  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  // Modal handling
  const showModal = () => {
    setIsModalVisible(true);
    closeDrawer();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <Layout className="min-h-screen">
      {/* Header Section */}
      <Header className="bg-white shadow-sm fixed w-full z-10" style={{ padding: '0 10px' }}>
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <BulbOutlined className="text-blue-600 text-xl mr-2" />
            <span className="text-base md:text-lg font-semibold">School Bulletin</span>
          </Link>

          {/* Desktop Navigation */}
          {isDesktop ? (
            <div className="flex items-center gap-4">
              <Input.Search
                placeholder="Search announcements..."
                onSearch={(value) => console.log('Search:', value)}
                className="w-full md:w-80 lg:w-96"
                id="desktop-search"
                name="desktop-search"
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showModal}
                className="hidden md:inline-flex"
              >
                New Post
              </Button>
            </div>
          ) : (
            /* Mobile Menu Button */
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={showDrawer}
              className="text-xl text-gray-800"
              style={{color: 'white'}}
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
          styles={{
            body: { padding: 16 }
          }}
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
              id="mobile-search"
              name="mobile-search"
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

      {/* Responsive Create Post Modal */}
      <Modal
        title="Create New Bulletin"
        open={isModalVisible}
        onCancel={handleCancel}
        okText="Publish"
        cancelText="Cancel"
        width={isDesktop ? 600 : '90%'}
        styles={{
          body: {
            padding: isDesktop ? 24 : 16,
            maxHeight: '70vh',
            overflowY: 'auto'
          }
        }}
        className="top-4 md:top-20"
        footer={null}
      >
        <CreatePostForm onCancel={handleCancel} />
      </Modal>

      {/* Main Content Area */}
      <Content className="mt-16 container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-h-[calc(100vh-160px)]">
          <Outlet />
        </div>
      </Content>

      {/* Footer */}
      <Footer className="text-center bg-gray-100 py-4 md:py-6">
        <div className="container mx-auto">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} School Bulletin Board • All rights reserved
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

// Separate form component
const CreatePostForm = ({ onCancel }) => {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('Submitted values:', values);
      form.resetFields();
      onCancel();
    });
  };

  // Upload configuration
  const uploadProps = {
    beforeUpload: (file) => {
      form.setFieldsValue({ image: file });
      return false;
    },
    maxCount: 1,
    showUploadList: false,
  };

  return (
    <Form form={form} layout="vertical" className="mt-2 md:mt-4">
      {/* Title Input */}
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Please enter a title' }]}
      >
        <Input 
          placeholder="Enter bulletin title" 
          size={isDesktop ? 'middle' : 'small'}
          id="post-title"
          name="post-title"
        />
      </Form.Item>

      {/* Content Textarea */}
      <Form.Item
        name="content"
        label="Content"
        rules={[{ required: true, message: 'Please enter the content' }]}
      >
        <Input.TextArea 
          rows={isDesktop ? 4 : 3}
          placeholder="Write your content here..." 
          showCount 
          maxLength={500}
          id="post-content"
          name="post-content"
        />
      </Form.Item>

      {/* Image Upload */}
      <Form.Item
        name="image"
        label="Attach Image"
        valuePropName="fileList"
        getValueFromEvent={(e) => e.fileList}
      >
        <Upload {...uploadProps}>
          <Button 
            icon={<UploadOutlined />}
            size={isDesktop ? 'middle' : 'small'}
            className="w-full md:w-auto"
          >
            {isDesktop ? 'Select Image' : 'Upload'}
          </Button>
        </Upload>
      </Form.Item>

      {/* Selected File Display */}
      {form.getFieldValue('image') && (
        <div className="mb-4 text-sm text-gray-500">
          Selected file: {form.getFieldValue('image').name}
        </div>
      )}

      {/* Category and Priority Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Select */}
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select
            placeholder="Select category"
            size={isDesktop ? 'middle' : 'small'}
            id="post-category"
            name="post-category"
          >
            <Option value="academic">Academic</Option>
            <Option value="events">Events</Option>
            <Option value="general">General</Option>
            <Option value="sports">Sports</Option>
          </Select>
        </Form.Item>

        {/* Priority Select */}
        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: 'Please select priority' }]}
        >
          <Select
            placeholder="Select priority"
            size={isDesktop ? 'middle' : 'small'}
            id="post-priority"
            name="post-priority"
          >
            <Option value="normal">Normal</Option>
            <Option value="urgent">Urgent</Option>
          </Select>
        </Form.Item>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={handleSubmit}>
          Publish
        </Button>
      </div>
    </Form>
  );
};

export default AppLayout;