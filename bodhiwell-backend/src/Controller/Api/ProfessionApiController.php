<?php

namespace App\Controller\Api;

use App\Entity\Profession;
use App\Repository\ProfessionRepository;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Professions')]
class ProfessionApiController extends AbstractController
{
    #[Route('/professions', name: 'api_professions_list', methods: ['GET'])]
    #[OA\Get(
        path: '/api/professions',
        summary: 'Listar profesiones activas',
        responses: [
            new OA\Response(response: 200, description: 'Lista de profesiones')
        ]
    )]
    public function list(ProfessionRepository $professionRepository): JsonResponse
    {
        $activeProfessions = $professionRepository->findBy(['status' => 'active']);

        if (empty($activeProfessions)) {
            return $this->json(['message' => 'No hay profesiones activas'], JsonResponse::HTTP_OK);
        }

        $data = array_map(fn(Profession $p) => [
            'uid'    => $p->getUid(),
            'name'   => $p->getName(),
            'status' => $p->getStatus(),
        ], $activeProfessions);

        return $this->json(['professions' => $data], JsonResponse::HTTP_OK);
    }
}
