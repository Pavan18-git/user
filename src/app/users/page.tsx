"use client"

import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message, Upload,
  Flex,
} from "antd";
import type { UploadProps } from 'antd';
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
// import { User } from "@/utils/types";
// import "@/assets/styles/dashboard.css";

import Title from "antd/es/typography/Title";
const { Option } = Select;

const Users: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imported, setImported] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/class/users");
        setUsers(response.data);
        setLoading(false);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error(
              "Failed to fetch users:",
              error.response.data.message
            );
          } else if (error.request) {
            console.error("No response received:", error.request);
          } else {
            console.error("Error", error.message);
          }
        } else {
          console.error("Unexpected error", error);
        }
        setLoading(false);
      }
    };

    fetchUsers();
  }, [imported]);

  console.log(users,">>>>>>>>>>>>>????????????")

  const columns = [
    { title: "User Name", dataIndex: "USER_NAME", key: "USER_NAME" },
    { title: "Name", dataIndex: "FIRST_NAME", key: "FIRST_NAME" },
    { title: "Batch Name", dataIndex: "BATCH_NAME", key: "BATCH_NAME" },
    { title: "Batch Code", dataIndex: "BATCH_CODE", key: "BATCH_CODE" },
    // { title: "Mobile", dataIndex: "MOBILE", key: "MOBILE" },
    {
      title: "Actions",
      key: "actions",
      render: (_: string, record: any) => (
        <Space size="middle">
          <Button key={`edit${record.USER_ID.toString()}`}
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Switch key={`tog${record.USER_ID.toString()}`}
            checked={record.STATUS === 1}
            onChange={() => {toggleUserStatus(record.USER_ID),console.log(record.USER_ID,">>>>>>>>>record.USER_ID")}}
          />
        </Space>
      ),
    },
  ];

  const props: UploadProps  = {
    action: '/api/import?subfolder=USERS&table=USERS',
    onChange({ file, fileList }) {
      if (file.status !== 'uploading') {
        setImported(true);
        message.success('Users imported successfully.')
      }
    },
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditMode(true);
    setModalVisible(true);
    form.setFieldsValue(user);  // Initialize form with selected user data
  };

  const toggleUserStatus = async (id: number) => {
    const userToUpdate = users.find((user) => user.USER_ID === id);
    console.log(userToUpdate,">>>>>>>>>hndmnc nd cm")
    if (userToUpdate) {
      const updatedUsers = users.map((user) =>
        user.USER_ID === id ? { ...user, STATUS: user.STATUS === 1 ? 0 : 1 } : user
      );
      setUsers(updatedUsers);
      userToUpdate.STATUS = userToUpdate?.STATUS === 1 ? 0 : 1;

      const payload = {
        ...userToUpdate,
        UserStatus : userToUpdate.STATUS
      }
      try {
        const response = await axios.post(`/api/class/users?action=status`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('User status updated successfully:', response.data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            console.error('User status update failed:', error.response.data.message);
            message.error(`User status update failed: ${error.response.data.message}`);
          } else if (error.request) {
            console.error('No response received:', error.request);
            message.error('No response received from the server.');
          } else {
            console.error('Error', error.message);
            message.error(`Error: ${error.message}`);
          }
        } else {
          console.error('Unexpected error', error);
          message.error('An unexpected error occurred.');
        }
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.USER_ID === id ? { ...user, STATUS: user.STATUS === 1 ? 0 : 1 } : user
          )
        );
      }
    }
  };

  const handleModalOk = async () => {
    form
      .validateFields()
      .then(async (values) => {
        if (editMode) {
          const updatedUsers = users.map((user) =>
            user.USER_ID === selectedUser!.USER_ID
              ? { ...user, ...values }
              : user
          );
          setUsers(updatedUsers);
          const response = await axios.put("/api/class/users", values, {
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log("User updation successful:", response.data);
        } else {
          try {
            if (!editMode)
              values.STATUS = 1;
            const response = await axios.post("/api/class/users?action=insert", values, {
              headers: {
                "Content-Type": "application/json",
              },
            });
            console.log("User creation successful:", response.data);
            setUsers([...users, values]);
          } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
              if (error.response) {
                console.error(
                  "User creation failed:",
                  error.response.data.message
                );
                message.error(
                  `User creation failed: ${error.response.data.message}`
                );
              } else if (error.request) {
                console.error("No response received:", error.request);
                message.error("No response received from the server.");
              } else {
                console.error("Error", error.message);
                message.error(`Error: ${error.message}`);
              }
            } else {
              console.error("Unexpected error", error);
              message.error("An unexpected error occurred.");
            }
          }
        }
        form.resetFields();
        setModalVisible(false);
        setSelectedUser(null);
        setEditMode(false);

      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  const handleModalCancel = () => {
    form.resetFields();
    setModalVisible(false);
    setSelectedUser(null);
    setEditMode(false);
  };

  return (
    <div>
      <Title level={4} className="pl-15 pt-10 mt-5">
        <span className="user" style={{color:'Black',lineHeight:'3.4'}}> USERS</span>
      </Title>
      <Flex justify="flex-end" align="flex-start" gap={6} className="mb-5 mr-5">
        <Button type="primary" onClick={() => setModalVisible(true)}>
          Add User
        </Button>
        {/* <ExcelDownload data={users} filename="users"  columns={columns}/> */}
        {/* <PdfDownload data={users} filename="users" columns={columns} showView={false} /> */}
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </Flex>
      <Table id="users-table"
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={editMode ? "Edit User" : "Add User"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}>
        <Form
          form={form}
          layout="vertical"
          name="userForm"
          // initialValues={selectedUser || undefined}
          >
          <Form.Item name="USER_ID" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="USER_NAME"
            label="User Name"
            rules={[{ required: true, message: "Please enter user name" }]}
          >
            <Input />
          </Form.Item>
          {/* {!editMode && (
            <Form.Item
              name="PASSWORD"
              label="Password"
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password />
            </Form.Item>
          )} */}
          <Form.Item
            name="ROLE"
            label="Role"
            rules={[{ required: true, message: "Please select role" }]}
          >
            <Select defaultValue={selectedUser?.ROLE || undefined}>
              <Option value="STU">Student</Option>
              <Option value="ADM">Admin</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="FIRST_NAME"
            label="First Name"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default Users;
