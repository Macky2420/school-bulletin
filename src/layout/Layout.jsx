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
  Upload, 
  message 
} from 'antd';
import { 
  BulbOutlined, 
  PlusOutlined, 
  MenuOutlined, 
  SearchOutlined,
  UploadOutlined 
} from '@ant-design/icons';
import { ref, push } from 'firebase/database';
import { realtimeDb, uploadToCloudinary } from '../database/firebaseConfig';

const { Header, Content, Footer } = Layout;
const { useBreakpoint } = Grid;
const { Option } = Select;

const AppLayout = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  const showDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);
  const showModal = () => { setIsModalVisible(true); closeDrawer(); };
  const handleCancel = () => setIsModalVisible(false);

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm fixed w-full z-10" style={{ padding: '0 10px' }}>
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center">
            <BulbOutlined className="text-blue-600 text-xl mr-2" />
            <span className="text-base md:text-lg font-semibold">School Bulletin</span>
          </Link>

          {isDesktop ? (
            <div className="flex items-center gap-4">
              <Input.Search
                placeholder="Search announcements..."
                className="w-full md:w-80 lg:w-96"
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
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={showDrawer}
              className="text-xl text-gray-800"
            />
          )}
        </div>
      </Header>

      {!isDesktop && (
        <Drawer
          title="Menu"
          placement="right"
          onClose={closeDrawer}
          open={drawerVisible}
          width={300}
        >
          <Space direction="vertical" className="w-full" size="middle">
            <Input.Search
              placeholder="Search announcements..."
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

      <Modal
        title="Create New Bulletin"
        open={isModalVisible}
        onCancel={handleCancel}
        width={isDesktop ? 600 : '90%'}
        footer={null}
      >
        <CreatePostForm onCancel={handleCancel} />
      </Modal>

      <Content className="mt-16 container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-h-[calc(100vh-160px)]">
          <Outlet />
        </div>
      </Content>

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

const CreatePostForm = ({ onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const screens = useBreakpoint();
  const isDesktop = screens.md;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Upload image to Cloudinary
      let imageUrl = null;
      if (values.image && values.image.length > 0) {
        const file = values.image[0].originFileObj;
        imageUrl = await uploadToCloudinary(file);
      }

      // Create post object
      const newPost = {
        title: values.title,
        author: values.author,
        content: values.content,
        category: values.category,
        priority: values.priority,
        image: imageUrl,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save to Firebase
      const postsRef = ref(realtimeDb, 'pendingPosts');
      await push(postsRef, newPost);

      message.success('Post submitted for admin approval!');
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(error.message || 'Failed to submit post. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    onChange: ({ fileList }) => {
      form.setFieldsValue({ image: fileList });
    },
    maxCount: 1,
    fileList: form.getFieldValue('image') || [],
    accept: 'image/*',
    listType: 'picture-card',
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false
    }
  };

  return (
    <Form form={form} layout="vertical" className="mt-2 md:mt-4">
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Please enter a title' }]}
      >
        <Input placeholder="Enter bulletin title" />
      </Form.Item>

      <Form.Item
        name="author"
        label="Author"
        rules={[{ required: true, message: 'Please enter your name' }]}
      >
        <Input placeholder="Enter your name" />
      </Form.Item>

      <Form.Item
        name="content"
        label="Content"
        rules={[{ required: true, message: 'Please enter the content' }]}
      >
        <Input.TextArea rows={4} showCount maxLength={500} />
      </Form.Item>

      <Form.Item
        name="image"
        label="Attach Image"
        valuePropName="fileList"
        getValueFromEvent={(e) => e.fileList}
        rules={[
          { 
            validator: (_, value) => 
              !value || (value[0]?.size || 0) < 10_000_000 
                ? Promise.resolve() 
                : Promise.reject('Image must be smaller than 10MB')
          }
        ]}
      >
        <Upload {...uploadProps}>
          <div>
            <UploadOutlined />
            <div className="mt-2">Upload Image</div>
          </div>
        </Upload>
      </Form.Item>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select placeholder="Select category">
            <Option value="academic">Academic</Option>
            <Option value="events">Events</Option>
            <Option value="sports">Sports</Option>
            <Option value="general">General</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
          rules={[{ required: true, message: 'Please select priority' }]}
        >
          <Select placeholder="Select priority">
            <Option value="normal">Normal</Option>
            <Option value="urgent">Urgent</Option>
          </Select>
        </Form.Item>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          type="primary" 
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </Button>
      </div>
    </Form>
  );
};

export default AppLayout;