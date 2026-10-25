<?php

namespace App\Controller\Api;

use App\Entity\Dimension;
use App\Repository\DimensionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA;

#[Route('/api')]
#[OA\Tag(name: 'Dimensions')]
class DimensionApiController extends AbstractController
{
    #[Route('/dimensions', name: 'api_dimensions_list', methods: ['GET'])]
    #[OA\Get(
        path: '/api/dimensions',
        summary: 'Listar dimensiones disponibles',
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista de dimensiones',
                content: new OA\JsonContent(type: 'array', items: new OA\Items(type: 'object'))
            )
        ]
    )]
    public function list(DimensionRepository $dimensionRepository): JsonResponse
    {
        $dimensions = $dimensionRepository->findAll();

        $data = array_map(fn(Dimension $d) => [
            'uid'       => $d->getUid(),
            'name'      => $d->getName(),
            'slug'      => $d->getSlug(),
            'colorCode' => $d->getColorCode(),
            'icon'      => $d->getIcon(),
        ], $dimensions);

        return $this->json($data);
    }
}
