<?php

namespace App\Controller\Api;

use App\Entity\Specialty;
use App\Repository\SpecialtyRepository;
use App\Repository\DimensionRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use OpenApi\Attributes as OA;

#[Route('/api')]
#[OA\Tag(name: 'Specialties')]
class SpecialtyApiController extends AbstractController
{
    #[Route('/specialties', name: 'api_specialties_list', methods: ['GET'])]
    #[OA\Get(
        path: '/api/specialties',
        summary: 'Listar especialidades disponibles (opcionalmente filtradas por dimensión)',
        parameters: [
            new OA\Parameter(name: 'dimension', in: 'query', required: false, description: 'UID de la dimensión', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista de especialidades',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(
                        properties: [
                            new OA\Property(property: 'uid', type: 'string'),
                            new OA\Property(property: 'name', type: 'string'),
                            new OA\Property(property: 'slug', type: 'string'),
                            new OA\Property(property: 'dimension', type: 'object', properties: [
                                new OA\Property(property: 'uid', type: 'string'),
                                new OA\Property(property: 'name', type: 'string'),
                                new OA\Property(property: 'slug', type: 'string'),
                                new OA\Property(property: 'colorCode', type: 'string')
                            ]),
                            new OA\Property(property: 'requires_msp', type: 'boolean'),
                            new OA\Property(property: 'can_be_base_profession', type: 'boolean'),
                            new OA\Property(property: 'masculine_title', type: 'string', nullable: true),
                            new OA\Property(property: 'feminine_title', type: 'string', nullable: true),
                            new OA\Property(property: 'neutral_title', type: 'string', nullable: true)
                        ]
                    )
                )
            )
        ]
    )]
    public function list(
        SpecialtyRepository $specialtyRepository,
        DimensionRepository $dimensionRepository,
        Request $request
    ): JsonResponse {
        $dimensionUid = $request->query->get('dimension');

        if ($dimensionUid) {
            $dimension = $dimensionRepository->findOneBy(['uid' => $dimensionUid]);
            $specialties = $dimension ? $specialtyRepository->findBy(['dimension' => $dimension]) : [];
        } else {
            $specialties = $specialtyRepository->findAll();
        }

        $data = array_map(fn(Specialty $s) => [
            'uid'      => $s->getUid(),
            'name'     => $s->getName(),
            'slug'     => $s->getSlug(),
            'dimension' => $s->getDimension() ? [
                'uid'       => $s->getDimension()->getUid(),
                'name'      => $s->getDimension()->getName(),
                'slug'      => $s->getDimension()->getSlug(),
                'colorCode' => $s->getDimension()->getColorCode(),
            ] : null,
            'requires_msp'            => $s->isMspRequired(),
            'can_be_base_profession'  => $s->isBaseProfession(),
            'masculine_title'         => $s->getPublicTitleMale(),
            'feminine_title'          => $s->getPublicTitleFemale(),
            'neutral_title'           => $s->getPublicTitleNeutral(),
        ], $specialties);

        return $this->json($data);
    }
}
