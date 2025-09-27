import React from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  SimpleGrid,
  Image,
  Badge,
  HStack,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Avatar,
} from '@chakra-ui/react';
import { useQuery } from 'react-query';
import { fetchRanking } from '../api';

// Component for ranking position badge
const RankBadge = ({ position }) => {
  let colorScheme = 'gray';
  let icon = '';

  if (position === 1) {
    colorScheme = 'yellow';
    icon = '🏆';
  } else if (position === 2) {
    colorScheme = 'gray';
    icon = '🥈';
  } else if (position === 3) {
    colorScheme = 'orange';
    icon = '🥉';
  }

  return (
    <Badge colorScheme={colorScheme} fontSize="md" p={2} borderRadius="md">
      {icon} #{position}
    </Badge>
  );
};

// Component for individual ranking card
const RankingCard = ({ article, position }) => {
  // Extract news details from the nested structure
  const newsData = article.newsDetails || article;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card shadow="md" _hover={{ shadow: "lg" }}>
      <CardBody>
        <Flex gap={4}>
          {/* Ranking position */}
          <VStack spacing={2}>
            <RankBadge position={position} />
            <VStack spacing={1}>
              <Text fontSize="2xl" fontWeight="bold" color="cyan.500">
                {article.averageScore?.toFixed(1) || '0.0'}
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                ⭐ Puntuación
              </Text>
              <Text fontSize="sm" color="gray.600">
                {article.voteCount || 0} votos
              </Text>
            </VStack>
          </VStack>

          {/* Article image */}
          <Box
            flexShrink={0}
            boxSize="120px"
            borderRadius="md"
            bg={!newsData.urlToImage ? "gradient(linear, to-br, cyan.400, blue.500)" : "transparent"}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {newsData.urlToImage ? (
              <Image
                src={newsData.urlToImage}
                alt={newsData.title}
                boxSize="120px"
                objectFit="cover"
                borderRadius="md"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                }}
              />
            ) : null}

            {!newsData.urlToImage && (
              <Text fontSize="3xl" color="#0bc5ea" textShadow="1px 1px 2px rgba(0,0,0,0.7)" fontWeight="bold">
                ∞
              </Text>
            )}
          </Box>

          {/* Article content */}
          <VStack align="start" spacing={2} flex={1} minW={0}>
            <Badge colorScheme="blue" variant="subtle">
              {newsData.source}
            </Badge>

            <Heading as="h3" size="md" lineHeight="short" noOfLines={2}>
              {newsData.title}
            </Heading>

            <Text color="gray.600" fontSize="sm" noOfLines={3}>
              {truncateText(newsData.description, 150)}
            </Text>

            <HStack justify="space-between" width="100%" pt={2}>
              <Text fontSize="xs" color="gray.500">
                {formatDate(newsData.publishedAt)}
              </Text>
              <Badge
                as="a"
                href={newsData.url}
                target="_blank"
                rel="noopener noreferrer"
                colorScheme="cyan"
                cursor="pointer"
                _hover={{ bg: 'cyan.600' }}
              >
                Leer más →
              </Badge>
            </HStack>
          </VStack>
        </Flex>
      </CardBody>
    </Card>
  );
};

// Main Ranking page component
export default function Ranking() {
  const { data: ranking, isLoading, error, refetch } = useQuery(
    'ranking',
    fetchRanking,
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    }
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="cyan.500" />
          <Text>Cargando ranking...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error al cargar el ranking: {error.message}
      </Alert>
    );
  }

  // Calculate some stats
  const stats = {
    totalArticles: Array.isArray(ranking) ? ranking.length : 0,
    totalVotes: Array.isArray(ranking) ? ranking.reduce((sum, article) => sum + (article.voteCount || 0), 0) : 0,
    avgScore: Array.isArray(ranking) && ranking.length > 0
      ? (ranking.reduce((sum, article) => sum + (article.averageScore || 0), 0) / ranking.length).toFixed(1)
      : '0.0',
    topScore: Array.isArray(ranking) && ranking.length > 0 ? ranking[0]?.averageScore?.toFixed(1) || '0.0' : '0.0'
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            ∞ Ranking de Noticias DevOps
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Las noticias mejor valoradas por nuestra comunidad
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="cyan.500">
                {stats.totalArticles}
              </Text>
              <Text color="gray.600" fontSize="sm">Total Artículos</Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {stats.totalVotes}
              </Text>
              <Text color="gray.600" fontSize="sm">Votos Totales</Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                {stats.avgScore}
              </Text>
              <Text color="gray.600" fontSize="sm">Puntuación Media</Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {stats.topScore}
              </Text>
              <Text color="gray.600" fontSize="sm">Mejor Puntuación</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Top 3 Special Section */}
        {ranking && ranking.length >= 3 && (
          <Box>
            <Heading as="h2" size="lg" mb={4} textAlign="center">
              🥇 Top 3 Noticias
            </Heading>
            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              {Array.isArray(ranking) && ranking.slice(0, 3).map((article, index) => {
                const newsData = article.newsDetails || article;
                return (
                  <Card key={article.newsId || newsData.id || newsData.url} shadow="lg" borderWidth={2}
                    borderColor={index === 0 ? 'yellow.400' : index === 1 ? 'gray.400' : 'orange.400'}>
                    <CardBody textAlign="center">
                      <VStack spacing={3}>
                        <RankBadge position={index + 1} />
                        <Box
                          height="120px"
                          width="100%"
                          borderRadius="md"
                          bg={!newsData.urlToImage ? "gradient(linear, to-br, cyan.400, blue.500)" : "transparent"}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {newsData.urlToImage ? (
                            <Image
                              src={newsData.urlToImage}
                              alt={newsData.title}
                              height="120px"
                              width="100%"
                              objectFit="cover"
                              borderRadius="md"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                              }}
                            />
                          ) : null}

                          {!newsData.urlToImage && (
                            <Text fontSize="4xl" color="#0bc5ea" textShadow="2px 2px 4px rgba(0,0,0,0.5)" fontWeight="bold">
                              ∞
                            </Text>
                          )}
                        </Box>
                        <Heading as="h3" size="sm" noOfLines={2}>
                          {newsData.title}
                        </Heading>
                        <Text fontSize="xl" fontWeight="bold" color="cyan.500">
                          ⭐ {article.averageScore?.toFixed(1) || '0.0'}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {article.voteCount || 0} votos
                        </Text>
                        <Badge colorScheme="blue">{newsData.source}</Badge>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Box>
        )}

        {/* Full Ranking List */}
        {ranking && ranking.length > 0 ? (
          <Box>
            <Heading as="h2" size="lg" mb={4}>
              📊 Ranking Completo
            </Heading>
            <VStack spacing={4} align="stretch">
              {Array.isArray(ranking) && ranking.map((article, index) => (
                <RankingCard
                  key={article.id || article.url}
                  article={article}
                  position={index + 1}
                />
              ))}
            </VStack>
          </Box>
        ) : (
          <Box textAlign="center" py={10}>
            <Text fontSize="xl" color="gray.500">
              No hay datos de ranking disponibles.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}