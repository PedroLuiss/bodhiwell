<?php

namespace App\Controller\Api;

use App\Repository\SystemSettingsRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA;

#[Route('/api/system-settings')]
#[OA\Tag(name: 'System Settings')]
class SystemSettingsApiController extends AbstractController
{
    #[Route('', name: 'api_system_settings_defaults', methods: ['GET'])]
    #[OA\Get(
        path: '/api/system-settings',
        summary: 'Obtener textos por defecto para el perfil del usuario',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Textos por defecto de fallback y placeholder',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'about',
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'fallback', type: 'string'),
                                new OA\Property(property: 'placeholder', type: 'string')
                            ]
                        ),
                        new OA\Property(
                            property: 'professional_info',
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'fallback', type: 'string'),
                                new OA\Property(property: 'placeholder', type: 'string')
                            ]
                        )
                    ]
                )
            )
        ]
    )]
    public function getDefaultTexts(SystemSettingsRepository $repository): JsonResponse
    {
        $keys = [
            'default_about_fallback',
            'default_about_placeholder',
            'default_professional_info_fallback',
            'default_professional_info_placeholder'
        ];

        $settings = $repository->findBy(['settingKey' => $keys]);
        $data = [];
        foreach ($settings as $setting) {
            $data[$setting->getSettingKey()] = $setting->getSettingValue();
        }

        return $this->json([
            'about' => [
                'fallback' => $data['default_about_fallback'] ?? '',
                'placeholder' => $data['default_about_placeholder'] ?? ''
            ],
            'professional_info' => [
                'fallback' => $data['default_professional_info_fallback'] ?? '',
                'placeholder' => $data['default_professional_info_placeholder'] ?? ''
            ]
        ]);
    }
}
