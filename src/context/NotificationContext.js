import React, { createContext, useContext, useState } from 'react'
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerFooter,
  Button,
  Box,
  Flex,
  Text,
  useDisclosure,
} from '@chakra-ui/react'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [notification, setNotification] = useState({
    title: '',
    description: '',
    actionText: '',
    onAction: null,
  })

  const showNotification = ({ title, description, actionText, onAction }) => {
    setNotification({ title, description, actionText, onAction })
    onOpen()
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg="blue.800" color="white">
          <DrawerFooter
            borderTopWidth="1px"
            borderColor="blue.700"
            padding="24px"
          >
            <Flex
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              {/* Left Side: Button(s) */}

              {/* Right Side: Title and Description */}
              <Box textAlign="left">
                <Text fontSize="xl" fontWeight="bold" mb={1}>
                  {notification.title}
                </Text>
                <Text fontSize="md" color="blue.100">
                  {notification.description}
                </Text>
              </Box>
              <Box textAlign="left">
                {notification.onAction && (
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      notification.onAction()
                      onClose()
                    }}
                    mr={3}
                  >
                    {notification.actionText}
                  </Button>
                )}
                <Button
                  variant="outline"
                  color="white"
                  onClick={onClose}
                  ms={1}
                >
                  Close
                </Button>
              </Box>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)
