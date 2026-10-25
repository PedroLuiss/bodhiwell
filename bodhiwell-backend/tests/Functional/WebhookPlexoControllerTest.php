<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;

class WebhookPlexoControllerTest extends WebTestCase
{
    public function testInstrumentWebhookStoresToken(): void
    {
    /** @var KernelBrowser $client */
    $client = static::createClient();

        $payload = [
            'instrumentToken' => 'tok_test_phpunit_'.uniqid(),
            'instrument' => ['token' => 'tok_nested_'.uniqid()],
        ];

        $client->request(
            'POST',
            '/webhook/plexo/instrument',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode($payload)
        );

    self::assertResponseIsSuccessful();

    $json = json_decode($client->getResponse()->getContent(), true);
    self::assertIsArray($json);
    self::assertTrue($json['ok'] ?? false);
    self::assertTrue($json['hasInstrumentToken'] ?? false);

        $container = static::getContainer();
        $projectDir = $container->getParameter('kernel.project_dir');
        $file = $projectDir.'/var/plexo/instrument_tokens.jsonl';

    self::assertFileExists($file, 'Se esperaba el archivo de tokens en var/plexo');
        $contents = file_get_contents($file);
    self::assertIsString($contents);
    self::assertNotSame('', $contents);
    self::assertStringContainsString('instrumentToken', $contents);
    }

    public function testTransactionWebhookOk(): void
    {
    /** @var KernelBrowser $client */
    $client = static::createClient();

        $payload = [
            'id' => 'txn_phpunit_'.uniqid(),
            'amount' => 1234,
            'status' => 'approved',
        ];

        $client->request(
            'POST',
            '/webhook/plexo/transaction',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode($payload)
        );

    self::assertResponseIsSuccessful();
    $json = json_decode($client->getResponse()->getContent(), true);
    self::assertIsArray($json);
    self::assertTrue($json['ok'] ?? false);
    }
}
