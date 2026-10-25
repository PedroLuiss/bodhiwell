<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\DependencyInjection\Loader\Configurator\request;

class ProfessionEndpointTest extends WebTestCase
{
    public function testListProfessionsReturnsExpectedStructure(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/professions');

        $this->assertResponseIsSuccessful(); // HTTP 2xx
        $this->assertResponseStatusCodeSame(200);
        $this->assertResponseFormatSame('json');

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);

        if (!empty($data)) {
            $profession = $data[0];
            $this->assertArrayHasKey('name', $profession);
            $this->assertArrayHasKey('status', $profession);
            $this->assertArrayHasKey('institute', $profession);
        } else {
            $this->assertEquals(['message' => 'No hay profesiones registradas'], $data);
        }
    }
}
