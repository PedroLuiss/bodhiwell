<?php

namespace App\Services;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class WordPressService
{
    private string $baseUrl;
    private string $secret;

    public function __construct(
        private HttpClientInterface $client,
        private LoggerInterface $logger,
        string $wordpressUrl,
        string $bridgeSecret
    ) {
        $this->baseUrl = rtrim($wordpressUrl, '/') . '/wp-json/bodhiwell/v1';
        $this->secret = $bridgeSecret;
    }

    public function createPost(array $data): array
    {
        try {
            $response = $this->client->request('POST', $this->baseUrl . '/posts', [
                'headers' => [
                    'X-Bodhiwell-Bridge-Secret' => $this->secret,
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            if ($response->getStatusCode() !== 201) {
                $content = $response->toArray(false);
                $this->logger->error('Error creating post in WordPress', [
                    'status' => $response->getStatusCode(),
                    'response' => $content,
                ]);
                throw new \RuntimeException($content['message'] ?? 'Error creating post in WordPress');
            }

            return $response->toArray();
        } catch (\Throwable $e) {
            $this->logger->error('Exception creating post in WordPress', [
                'exception' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function getPostsByAuthor(string $email): array
    {
        try {
            $response = $this->client->request('GET', $this->baseUrl . '/posts', [
                'headers' => [
                    'X-Bodhiwell-Bridge-Secret' => $this->secret,
                ],
                'query' => [
                    'author_email' => $email,
                ],
            ]);

            if ($response->getStatusCode() !== 200) {
                $content = $response->toArray(false);
                $this->logger->error('Error fetching posts from WordPress', [
                    'status' => $response->getStatusCode(),
                    'response' => $content,
                ]);
                throw new \RuntimeException($content['message'] ?? 'Error fetching posts from WordPress');
            }

            return $response->toArray();
        } catch (\Throwable $e) {
            $this->logger->error('Exception fetching posts from WordPress', [
                'email' => $email,
                'exception' => $e->getMessage(),
            ]);
            return [];
        }
    }

    public function updatePost(int $id, array $data): array
    {
        try {
            $response = $this->client->request('PUT', $this->baseUrl . '/posts/' . $id, [
                'headers' => [
                    'X-Bodhiwell-Bridge-Secret' => $this->secret,
                    'Content-Type' => 'application/json',
                ],
                'json' => $data,
            ]);

            if ($response->getStatusCode() !== 200) {
                $content = $response->toArray(false);
                throw new \RuntimeException($content['message'] ?? 'Error updating post in WordPress');
            }

            return $response->toArray();
        } catch (\Throwable $e) {
            $this->logger->error('Exception updating post in WordPress', [
                'id' => $id,
                'exception' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function deletePost(int $id): bool
    {
        try {
            $response = $this->client->request('DELETE', $this->baseUrl . '/posts/' . $id, [
                'headers' => [
                    'X-Bodhiwell-Bridge-Secret' => $this->secret,
                ],
            ]);

            if ($response->getStatusCode() !== 200) {
                $content = $response->toArray(false);
                throw new \RuntimeException($content['message'] ?? 'Error deleting post in WordPress');
            }

            return true;
        } catch (\Throwable $e) {
            $this->logger->error('Exception deleting post in WordPress', [
                'id' => $id,
                'exception' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
