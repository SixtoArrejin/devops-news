import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Image,
  Badge,
  HStack,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useQuery } from 'react-query';
import { fetchNews, voteForNews } from '../api';

// Component to render star rating for voting
const StarRating = ({ onRate, disabled }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <HStack spacing={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          boxSize={5}
          color={star <= hoveredRating ? 'yellow.400' : 'gray.300'}
          cursor={disabled ? 'not-allowed' : 'pointer'}
          onMouseEnter={() => !disabled && setHoveredRating(star)}
          onMouseLeave={() => !disabled && setHoveredRating(0)}
          onClick={() => !disabled && onRate(star)}
        />
      ))}
    </HStack>
  );
};

// Component for individual news card
const NewsCard = ({ article }) => {
  const [hasVoted, setHasVoted] = useState(() => {
    // Check if user has already voted for this article
    const voted = localStorage.getItem(`voted_${article.id}`);
    return voted === 'true';
  });
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (score) => {
    if (hasVoted || isVoting) return;

    setIsVoting(true);
    try {
      // Usar el ID de la noticia como newsId y pasar el score directamente (1-5)
      await voteForNews(article.id, score);
      localStorage.setItem(`voted_${article.id}`, 'true');
      setHasVoted(true);
    } catch (error) {
      console.error('Error voting:', error);
    }
    setIsVoting(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card maxW="sm" shadow="md" _hover={{ shadow: "lg" }}>
      <CardBody>
        <Box
          height="200px"
          width="100%"
          borderRadius="lg"
          mb={4}
          bg={!article.urlToImage ? "gradient(linear, to-r, cyan.400, blue.500)" : "transparent"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          {article.urlToImage ? (
            <Image
              src={article.urlToImage}
              alt={article.title}
              borderRadius="lg"
              height="200px"
              width="100%"
              objectFit="cover"
              onError={(e) => {
                // Si la imagen falla, mostrar el símbolo infinito
                e.target.style.display = 'none';
                e.target.parentElement.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
              }}
            />
          ) : null}

          {!article.urlToImage && (
            <Text fontSize="6xl" color="#0bc5ea" textShadow="2px 2px 4px rgba(0,0,0,0.5)" fontWeight="bold">
              ∞
            </Text>
          )}
        </Box>

        <VStack align="start" spacing={3}>
          <Badge colorScheme="cyan" variant="subtle">
            {article.source}
          </Badge>

          <Heading as="h3" size="md" lineHeight="short">
            {truncateText(article.title, 80)}
          </Heading>

          <Text color="gray.600" fontSize="sm">
            {truncateText(article.description, 120)}
          </Text>

          <HStack justify="space-between" width="100%">
            <Text fontSize="xs" color="gray.500">
              {formatDate(article.publishedAt)}
            </Text>
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="semibold">
                ⭐ {article.voteDetails?.averageScore?.toFixed(1) || '0.0'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                ({article.voteDetails?.voteCount || 0} votos)
              </Text>
            </HStack>
          </HStack>

          <VStack width="100%" spacing={2}>
            {!hasVoted && !isVoting && (
              <Box>
                <Text fontSize="sm" mb={2} textAlign="center">
                  Califica esta noticia:
                </Text>
                <StarRating onRate={handleVote} disabled={hasVoted || isVoting} />
              </Box>
            )}

            {hasVoted && (
              <Text fontSize="sm" color="green.500" textAlign="center">
                ✓ Ya votaste por esta noticia
              </Text>
            )}

            {isVoting && (
              <HStack>
                <Spinner size="sm" />
                <Text fontSize="sm">Enviando voto...</Text>
              </HStack>
            )}

            <Button
              as="a"
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              colorScheme="cyan"
              variant="outline"
              size="sm"
              width="100%"
            >
              Leer más →
            </Button>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Main News page component
export default function Noticias() {
  const { data: news, isLoading, error, refetch } = useQuery(
    'news',
    fetchNews,
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
          <Text>Cargando noticias...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        Error al cargar las noticias: {error.message}
        <Button ml={4} onClick={() => refetch()}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            ∞ Últimas Noticias DevOps
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Mantente actualizado con las últimas tendencias y herramientas del mundo DevOps
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <CardBody textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="cyan.500">
                {Array.isArray(news) ? news.length : 0}
              </Text>
              <Text color="gray.600">Noticias Disponibles</Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                {Array.isArray(news) ? news.reduce((sum, article) => sum + (article.voteDetails?.voteCount || 0), 0) : 0}
              </Text>
              <Text color="gray.600">Votos Totales</Text>
            </CardBody>
          </Card>

          <Card>
            <CardBody textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color="yellow.500">
                {Array.isArray(news) && news.length > 0
                  ? (news.reduce((sum, article) => sum + (article.voteDetails?.averageScore || 0), 0) / news.length).toFixed(1)
                  : '0.0'
                }
              </Text>
              <Text color="gray.600">Puntuación Promedio</Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* News Grid */}
        {Array.isArray(news) && news.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {news.map((article) => (
              <NewsCard key={article.id || article.url} article={article} />
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={10}>
            <Text fontSize="xl" color="gray.500">
              No hay noticias disponibles en este momento.
            </Text>
            <Button mt={4} onClick={() => refetch()}>
              Actualizar
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
}