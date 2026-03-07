import React, { useState } from "react";
import {
  Tooltip,
  Button,
  Box,
  Text,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  MenuDivider,
  DrawerOverlay,
  DrawerHeader,
  DrawerContent,
  DrawerBody,
  Input,
  useToast,
  Spinner,
  Drawer,
  useDisclosure
} from "@chakra-ui/react";

import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../useAvatar/userListItem";
import NotificationBadge from "@parthamk/notification-badge";
import API_URL from "../../config/api";

const SideDrawer = () => {

  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { user, setSelectedChat, chats, setChats, notifications, setNotifications } = ChatState();

  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {

    if (!search) {
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {

      setLoading(true);

      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const { data } = await axios.get(
        `${API_URL}/api/user?search=${search}`,
        config
      );

      setSearchResult(data);
      setLoading(false);

    } catch (error) {

      toast({
        title: "Error occurred",
        description: "Failed to load search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      setLoading(false);
    }
  };

  const accessChat = async (userId) => {

    try {

      setLoadingChat(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        `${API_URL}/api/chat`,
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();

    } catch (error) {

      toast({
        title: "Error fetching chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });

      setLoadingChat(false);
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px"
        borderWidth="5px"
      >

        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans">
          Hey-Buddy
        </Text>

        <div>

          <Menu>

            <MenuButton p={1}>
              <NotificationBadge
                count={notifications.length}
                effect={["shake", "fade"]}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>

            <MenuList pl={2}>
              {!notifications.length && "No New Messages"}

              {notifications.map((notif) => (

                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotifications(
                      notifications.filter((n) => n !== notif)
                    );
                  }}
                >

                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${notif.sender.name}`}

                </MenuItem>

              ))}

            </MenuList>

          </Menu>

          <Menu>

            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>

              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />

            </MenuButton>

            <MenuList>

              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>

              <MenuDivider />

              <MenuItem onClick={logoutHandler}>
                Logout
              </MenuItem>

            </MenuList>

          </Menu>

        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>

        <DrawerOverlay />

        <DrawerContent>

          <DrawerHeader borderBottomWidth="1px">
            Search Users
          </DrawerHeader>

          <DrawerBody>

            <Box display="flex" pb={2}>

              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <Button onClick={handleSearch} colorScheme="blue">
                Go
              </Button>

            </Box>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (

                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />

              ))
            )}

            {loadingChat && (
              <Spinner ml="auto" display="flex" />
            )}

          </DrawerBody>

        </DrawerContent>

      </Drawer>
    </>
  );
};

export default SideDrawer;