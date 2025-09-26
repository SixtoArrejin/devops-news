import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
  Button,
  Link,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  FiCode,
  FiTrendingUp,
  FiUsers,
  FiGlobe,
  FiStar,
  FiTarget,
  FiZap,
  FiHeart
} from 'react-icons/fi';
import { CheckCircleIcon, ExternalLinkIcon } from '@chakra-ui/icons';

export default function About() {
  const features = [
    {
      icon: FiGlobe,
      title: 'Noticias Actualizadas',
      description: 'Contenido actualizado automáticamente cada 2 horas desde las mejores fuentes DevOps'
    },
    {
      icon: FiStar,
      title: 'Sistema de Votación',
      description: 'Vota por las noticias más relevantes y descubre qué opina la comunidad'
    },
    {
      icon: FiTrendingUp,
      title: 'Rankings en Tiempo Real',
      description: 'Ve las noticias mejor valoradas y las tendencias más populares'
    },
    {
      icon: FiUsers,
      title: 'Comunidad DevOps',
      description: 'Únete a otros profesionales para descubrir el mejor contenido DevOps'
    }
  ];

  const technologies = [
    'Node.js + Express',
    'React + Chakra UI',
    'Redis Cloud',
    'NewsAPI',
    'React Query'
  ];

  const sources = [
    'TechCrunch',
    'Hacker News',
    'DevOps.com',
    'The New Stack',
    'InfoWorld',
    'Y más...'
  ];

  return (
    <Box p={6}>
      <VStack spacing={8} align="stretch">
        {/* Hero Section */}
        <Box textAlign="center" py={10}>
          <Heading as="h1" size="2xl" mb={4}>
            <span style={{ color: '#0bc5ea' }}>∞ </span>
            <span style={{ color: '#3182ce' }}>Dev</span>
            <span style={{ color: '#9f7aea' }}>Ops</span>
            <span style={{ color: '#2d3748' }}> News</span>
          </Heading>
          <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
            Tu fuente centralizada de noticias, tendencias y conocimiento del mundo DevOps.
            Mantente actualizado con lo último en herramientas, prácticas y tecnologías.
          </Text>
        </Box>

        {/* Mission Statement */}
        <Card>
          <CardBody>
            <HStack spacing={4} align="start">
              <Icon as={FiTarget} boxSize={8} color="cyan.500" mt={1} />
              <VStack align="start" spacing={2}>
                <Heading as="h3" size="md">Nuestra Misión</Heading>
                <Text color="gray.600">
                  Democratizar el acceso a información de calidad sobre DevOps, permitiendo que la comunidad
                  vote y priorice el contenido más valioso. Creamos un espacio donde profesionales pueden
                  descubrir, evaluar y compartir conocimiento relevante.
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Features Grid */}
        <Box>
          <Heading as="h2" size="lg" mb={6} textAlign="center">
            ✨ Características Principales
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {features.map((feature, index) => (
              <Card key={index} _hover={{ shadow: 'md' }}>
                <CardBody>
                  <HStack spacing={4} align="start">
                    <Icon as={feature.icon} boxSize={6} color="cyan.500" />
                    <VStack align="start" spacing={2}>
                      <Heading as="h4" size="sm">{feature.title}</Heading>
                      <Text fontSize="sm" color="gray.600">{feature.description}</Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>

        {/* How it Works */}
        <Card>
          <CardBody>
            <Heading as="h3" size="md" mb={4}>
              <Icon as={FiZap} mr={2} color="yellow.500" />
              ¿Cómo Funciona?
            </Heading>
            <List spacing={3}>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <strong>Recopilación Automática:</strong> Nuestro sistema busca noticias cada 2 horas desde fuentes confiables
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <strong>Votación Comunitaria:</strong> Los usuarios pueden votar del 1 al 5 estrellas por artículo (una vez por navegador)
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <strong>Rankings Dinámicos:</strong> Las noticias se ordenan por puntuación promedio y número de votos
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircleIcon} color="green.500" />
                <strong>Curation de Calidad:</strong> Solo el mejor contenido llega al top gracias a la comunidad
              </ListItem>
            </List>
          </CardBody>
        </Card>

        {/* Technical Stack & Sources */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card>
            <CardBody>
              <Heading as="h3" size="md" mb={4}>
                <Icon as={FiCode} mr={2} color="blue.500" />
                Stack Tecnológico
              </Heading>
              <VStack align="start" spacing={2}>
                {technologies.map((tech, index) => (
                  <HStack key={index}>
                    <Badge colorScheme="blue" variant="subtle">{tech}</Badge>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading as="h3" size="md" mb={4}>
                <Icon as={FiGlobe} mr={2} color="green.500" />
                Fuentes de Noticias
              </Heading>
              <VStack align="start" spacing={2}>
                {sources.map((source, index) => (
                  <HStack key={index}>
                    <Badge colorScheme="green" variant="subtle">{source}</Badge>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Statistics */}
        <Card bg="gray.50">
          <CardBody>
            <Heading as="h3" size="md" mb={6} textAlign="center">
              📊 Impacto de la Comunidad
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} textAlign="center">
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="cyan.500">24/7</Text>
                <Text fontSize="sm" color="gray.600">Monitoreo Activo</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">5⭐</Text>
                <Text fontSize="sm" color="gray.600">Sistema de Votación</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="green.500">∞</Text>
                <Text fontSize="sm" color="gray.600">Fuentes Confiables</Text>
              </VStack>
              <VStack>
                <Text fontSize="3xl" fontWeight="bold" color="purple.500">🚀</Text>
                <Text fontSize="sm" color="gray.600">Siempre Actualizado</Text>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Call to Action */}
        <Card bg="cyan.50" borderLeft="4px" borderLeftColor="cyan.500">
          <CardBody>
            <HStack spacing={4} align="start">
              <Icon as={FiHeart} boxSize={6} color="cyan.500" />
              <VStack align="start" spacing={3}>
                <Heading as="h3" size="md" color="cyan.700">
                  ¡Únete a la Comunidad DevOps!
                </Heading>
                <Text color="cyan.600">
                  Explora las últimas noticias, vota por el contenido más valioso y ayuda a otros
                  profesionales a descubrir información de calidad. Tu participación hace la diferencia.
                </Text>
                <HStack spacing={4}>
                  <Button as={Link} href="/" colorScheme="cyan" size="sm">
                    Ver Noticias
                  </Button>
                  <Button as={Link} href="/ranking" variant="outline" colorScheme="cyan" size="sm">
                    Explorar Ranking
                  </Button>
                </HStack>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Footer */}
        <Divider />
        <Box textAlign="center" py={4}>
          <Text fontSize="sm" color="gray.500">
            <span style={{ color: '#0bc5ea' }}>∞ </span>
            <span style={{ color: '#3182ce' }}>Dev</span>
            <span style={{ color: '#9f7aea' }}>Ops</span>
            <span style={{ color: '#2d3748' }}> News</span>
            <span> - Construido con ❤️ para la comunidad DevOps</span>
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1}>
            Código abierto • Datos en tiempo real • Votación comunitaria
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}