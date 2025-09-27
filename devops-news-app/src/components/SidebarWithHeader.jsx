import React, { useState } from 'react';
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FiHome, FiMenu, FiUsers, FiMoreVertical, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { BiNetworkChart } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { adminRefreshNews, adminResetSystem } from '../api';

const getNavItems = () => {
  const navItems = [
    { name: 'Noticias', icon: FiHome, route: '/' },
    { name: 'Ranking', icon: BiNetworkChart, route: '/ranking' },
    { name: 'Acerca de', icon: FiUsers, route: '/about' },
  ];

  return navItems;
};

export default function SidebarWithHeader({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH='100vh' bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
      <Drawer autoFocus={false} isOpen={isOpen} placement='left' onClose={onClose} returnFocusOnClose={false} onOverlayClick={onClose} size='full'>
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p='4'>
        {children}
      </Box>
    </Box>
  );
}

const SidebarContent = ({ onClose, ...rest }) => {
  const navItems = getNavItems();

  return (
    <Box
      transition='3s ease'
      bg={useColorModeValue('white', 'gray.900')}
      borderRight='1px'
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos='fixed'
      h='full'
      {...rest}
    >
      <Flex h='20' alignItems='center' mx='8' justifyContent='space-between'>
        <Text fontSize='2xl' fontFamily='monospace' fontWeight='bold'>
          <span style={{ color: '#0bc5ea' }}>∞ </span>
          <span style={{ color: '#3182ce' }}>Dev</span>
          <span style={{ color: '#9f7aea' }}>Ops</span>
          <span style={{ color: '#2d3748' }}> News</span>
        </Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {navItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} route={link.route} onClose={onClose}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

const NavItem = ({ icon, children, route, onClose, ...rest }) => {
  return (
    <Link to={route} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
      <Flex
        align='center'
        p='4'
        mx='4'
        borderRadius='lg'
        role='group'
        cursor='pointer'
        _hover={{
          bg: 'cyan.400',
          color: 'white',
        }}
        onClick={onClose}
        {...rest}
      >
        {icon && (
          <Icon
            mr='4'
            fontSize='16'
            _groupHover={{
              color: 'white',
            }}
            as={icon}
          />
        )}
        {children}
      </Flex>
    </Link>
  );
};

const AdminMenu = () => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await adminRefreshNews();

      toast({
        title: '✅ Noticias actualizadas',
        description: 'Las noticias han sido refrescadas exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      // Recargar la página para mostrar las noticias nuevas
      window.location.reload();
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudieron refrescar las noticias',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const handleReset = async () => {
    if (!window.confirm('⚠️ ¿Estás seguro de que quieres resetear COMPLETAMENTE el sistema? Esta acción elimina todas las noticias y votos y no se puede deshacer.')) {
      return;
    }

    setIsLoading(true);
    try {
      await adminResetSystem();

      toast({
        title: '🔄 Reset completado',
        description: 'Sistema completamente reseteado: noticias y votos eliminados',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      // Limpiar localStorage también
      localStorage.clear();
      // Recargar la página
      window.location.reload();
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudo completar el reset',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Opciones de administración"
        icon={isLoading ? <Spinner size="sm" /> : <FiMoreVertical />}
        variant="ghost"
        isDisabled={isLoading}
      />
      <MenuList>
        <MenuItem
          icon={<FiRefreshCw />}
          onClick={handleRefresh}
          isDisabled={isLoading}
        >
          Refrescar Noticias
        </MenuItem>
        <MenuItem
          icon={<FiTrash2 />}
          onClick={handleReset}
          isDisabled={isLoading}
          color="red.500"
        >
          Reset Completo
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

const MobileNav = ({ onOpen, ...rest }) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height='20'
      alignItems='center'
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth='1px'
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      {...rest}
    >
      <IconButton display={{ base: 'flex', md: 'none' }} onClick={onOpen} variant='outline' aria-label='open menu' icon={<FiMenu />} />

      <HStack spacing={{ base: '0', md: '6' }}>
        <Text fontSize='lg' fontFamily='monospace' fontWeight='bold'>
          <span style={{ color: '#0bc5ea' }}>∞ </span>
          <span style={{ color: '#3182ce' }}>Dev</span>
          <span style={{ color: '#9f7aea' }}>Ops</span>
          <span style={{ color: '#2d3748' }}> News</span>
        </Text>
        <AdminMenu />
      </HStack>
    </Flex>
  );
};
