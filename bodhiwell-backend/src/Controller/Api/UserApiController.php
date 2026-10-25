<?php

namespace App\Controller\Api;

use App\Services\UserService;
use App\Entity\User as AppUser;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use App\Dto\Profile\UpdatePatientProfileDto;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\Profile\PatientProfileService;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use App\Enum\UserStatusEnum;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use OpenApi\Attributes as OA;

class UserApiController extends AbstractController
{
    public function __construct(
        private readonly UserService $userService,
        private readonly UserRepository $userRepository,
        private PatientProfileService $patientProfileService,
        private Security $security
    ) {}

    private function error(string $message, int $status): JsonResponse
    {
        return $this->json(['code' => $status, 'message' => $message], $status);
    }

    #[Route('/professionals', name: 'api_professionals', methods: ['GET'])]
    #[OA\Tag(name: 'Professionals')]
    #[OA\Get(
        path: '/professionals',
        summary: 'Listar profesionales',
        description: "### 🔍 INSTRUCCIONES DE BÚSQUEDA
### 
### • BÚSQUEDA (q): Filtra por Nombre, Profesión o Especialidad.
### • DIMENSIÓN (dimension): Filtra por el UID de la Dimensión.
### • ESPECIALIDADES (specialties): Filtra por uno o más UIDs de especialidades.
### 
### *Nota: Si no usas filtros, se muestran todos los profesionales activos.*",
        parameters: [
            new OA\Parameter(name: 'q', in: 'query', description: 'Término de búsqueda (Nombre, Profesión o Especialidad)', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'dimension', in: 'query', description: 'UID de la dimensión (Cuerpo, Mente, Energía o Conciencia)', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'specialties', in: 'query', description: 'Array de UIDs de especialidades específicas', schema: new OA\Schema(type: 'array', items: new OA\Items(type: 'string')))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista de profesionales',
                content: new OA\JsonContent(type: 'array', items: new OA\Items(type: 'object'))
            )
        ]
    )]
    public function professionals(Request $request): JsonResponse
    {
        $searchDto = new \App\Dto\SearchProfessionalDto(
            $request->query->get('q'),
            $request->query->get('dimension'),
            (array) ($request->query->all()['specialties'] ?? [])
        );

        $pros = $this->userRepository->searchProfessionals($searchDto);

        $data = array_map(
            fn(AppUser $u) => $this->userService->serializeForList($u),
            $pros
        );

        return $this->json($data, Response::HTTP_OK);
    }

    #[OA\Tag(name: 'User Profile')]
    #[Route(path: '/profile/{uid}', name: 'api_user_detail', methods: ['GET'])]
    #[OA\Get(
        path: '/profile/{uid}',
        summary: 'Obtener detalle de un perfil',
        parameters: [
            new OA\Parameter(name: 'uid', in: 'path', required: true, description: 'UID del usuario', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detalle del perfil'),
            new OA\Response(response: 404, description: 'Usuario no encontrado')
        ]
    )]
    public function getUserDetail(string $uid, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->findOneBy(['uid' => $uid]);
        if (!$user) {
            return $this->error('No autorizado o recurso no disponible.', Response::HTTP_NOT_FOUND);
        }

        $profile = $this->userService->serializeProfile($user);

        return $this->json(['profile' => $profile], Response::HTTP_OK);
    }

    #[OA\Tag(name: 'User Profile')]
    #[Route(path: '/api/profile', name: 'api_user_update', methods: ['POST', 'PUT', 'PATCH'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        path: '/api/profile',
        summary: 'Actualizar perfil del usuario autenticado (POST)',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'first_name', type: 'string', example: 'Abel'),
                        new OA\Property(property: 'last_name', type: 'string', example: 'Mena'),
                        new OA\Property(property: 'dni', type: 'string', example: '12345678X'),
                        new OA\Property(property: 'type_account', type: 'string', enum: ['professional', 'patient'], example: 'professional'),
                        new OA\Property(property: 'msp_number', type: 'string', example: 'MSP-54321'),
                        new OA\Property(property: 'details', type: 'object', properties: [
                            new OA\Property(property: 'date_birth', type: 'string', format: 'date', example: '1990-01-01'),
                            new OA\Property(property: 'gender', type: 'string', example: 'male'),
                            new OA\Property(property: 'country', type: 'string', example: 'ES'),
                            new OA\Property(property: 'city', type: 'string', example: 'Madrid'),
                            new OA\Property(property: 'zipcode', type: 'string', example: '28001'),
                            new OA\Property(property: 'address', type: 'string', example: 'Calle Mayor 1'),
                            new OA\Property(property: 'language', type: 'string', example: 'Español'),
                            new OA\Property(property: 'about', type: 'string', example: 'Especialista profesional con más de 10 años de experiencia.'),
                            new OA\Property(property: 'phone', type: 'string', example: '+34600112233'),
                            new OA\Property(property: 'account_number', type: 'string', example: 'ES12345678901234567890'),
                            new OA\Property(property: 'holder_name', type: 'string', example: 'Abel Mena'),
                            new OA\Property(property: 'bank_name', type: 'string', example: 'Banco Santander'),
                            new OA\Property(property: 'consult_price', type: 'number', example: 50),
                            new OA\Property(property: 'consult_time', type: 'integer', example: 45),
                            new OA\Property(property: 'consult_type', type: 'string', enum: ['presential', 'virtual', 'hybrid'], example: 'virtual'),
                            new OA\Property(property: 'base_profession_uid', type: 'string', nullable: true),
                            new OA\Property(property: 'short_description', type: 'string', example: 'Expertos en terapias alternativas'),
                            new OA\Property(property: 'professional_info', type: 'string', example: 'Detalles sobre mi trayectoria profesional...'),
                            new OA\Property(property: 'policies', type: 'boolean', example: true),
                        ]),
                        new OA\Property(property: 'studies', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'uid', type: 'string', nullable: true),
                            new OA\Property(property: 'name', type: 'string', example: 'Grado en Psicología'),
                            new OA\Property(property: 'institute', type: 'string', example: 'Universidad de Barcelona'),
                            new OA\Property(property: 'type', type: 'string', example: 'higher_education'),
                            new OA\Property(property: 'date_start', type: 'string', format: 'date', example: '2010-09-01'),
                            new OA\Property(property: 'date_end', type: 'string', format: 'date', example: '2014-06-30'),
                            new OA\Property(property: 'specialty_uid', type: 'string', nullable: true),
                            new OA\Property(property: 'delete', type: 'boolean', example: false)
                        ]))
                    ]
                ),
                new OA\MediaType(
                    mediaType: 'multipart/form-data',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'first_name', type: 'string', example: 'Abel'),
                            new OA\Property(property: 'last_name', type: 'string', example: 'Mena'),
                            new OA\Property(property: 'dni', type: 'string', example: '12345678X'),
                            new OA\Property(property: 'msp_number', type: 'string', example: 'MSP-54321'),
                            new OA\Property(property: 'type_account', type: 'string', enum: ['professional', 'patient'], example: 'professional'),
                            new OA\Property(property: 'details[date_birth]', type: 'string', example: '1990-01-01'),
                            new OA\Property(property: 'details[gender]', type: 'string', example: 'male'),
                            new OA\Property(property: 'details[country]', type: 'string', example: 'ES'),
                            new OA\Property(property: 'details[city]', type: 'string', example: 'Madrid'),
                            new OA\Property(property: 'details[zipcode]', type: 'string', example: '28001'),
                            new OA\Property(property: 'details[address]', type: 'string', example: 'Calle Mayor 1'),
                            new OA\Property(property: 'details[language]', type: 'string', example: 'Español'),
                            new OA\Property(property: 'details[about]', type: 'string', example: 'Especialista profesional con más de 10 años de experiencia.'),
                            new OA\Property(property: 'details[phone]', type: 'string', example: '+34600112233'),
                            new OA\Property(property: 'details[account_number]', type: 'string', example: 'ES12345678901234567890'),
                            new OA\Property(property: 'details[holder_name]', type: 'string', example: 'Abel Mena'),
                            new OA\Property(property: 'details[bank_name]', type: 'string', example: 'Banco Santander'),
                            new OA\Property(property: 'details[consult_price]', type: 'number', example: 50),
                            new OA\Property(property: 'details[consult_time]', type: 'integer', example: 45),
                            new OA\Property(property: 'details[consult_type]', type: 'string', example: 'virtual'),
                            new OA\Property(property: 'details[base_profession_uid]', type: 'string', nullable: true),
                            new OA\Property(property: 'details[main_specialty_uid]', type: 'string', nullable: true),
                            new OA\Property(property: 'details[short_description]', type: 'string', example: 'Expertos en terapias alternativas'),
                            new OA\Property(property: 'details[professional_info]', type: 'string', example: 'Detalles sobre mi trayectoria profesional...'),
                            new OA\Property(property: 'details[policies]', type: 'boolean', example: true),
                            new OA\Property(property: 'details[image]', type: 'string', format: 'binary'),
                            new OA\Property(property: 'details[banner_image]', type: 'string', format: 'binary'),
                            new OA\Property(property: 'studies[0][uid]', type: 'string', nullable: true),
                            new OA\Property(property: 'studies[0][name]', type: 'string', example: 'Grado en Psicología'),
                            new OA\Property(property: 'studies[0][institute]', type: 'string', example: 'Universidad de Barcelona'),
                            new OA\Property(property: 'studies[0][type]', type: 'string', example: 'higher_education'),
                            new OA\Property(property: 'studies[0][date_start]', type: 'string', example: '2010-09-01'),
                            new OA\Property(property: 'studies[0][date_end]', type: 'string', example: '2014-06-30'),
                            new OA\Property(property: 'studies[0][specialty_uid]', type: 'string', nullable: true),
                            new OA\Property(property: 'studies[0][delete]', type: 'boolean', example: false),
                            new OA\Property(property: 'studies[0][url_certificate]', type: 'string', format: 'binary')
                        ]
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(response: 200, description: 'Perfil actualizado'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 400, description: 'Datos inválidos'),
            new OA\Response(response: 422, description: 'Error de validación')
        ]
    )]
    #[OA\Put(
        path: '/api/profile',
        summary: 'Actualizar perfil del usuario autenticado (PUT)',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'first_name', type: 'string', example: 'Abel'),
                        new OA\Property(property: 'last_name', type: 'string', example: 'Mena'),
                        new OA\Property(property: 'dni', type: 'string', example: '12345678X'),
                        new OA\Property(property: 'type_account', type: 'string', enum: ['professional', 'patient'], example: 'professional'),
                        new OA\Property(property: 'details', type: 'object', properties: [
                            new OA\Property(property: 'date_birth', type: 'string', format: 'date', example: '1990-01-01'),
                            new OA\Property(property: 'gender', type: 'string', example: 'male'),
                            new OA\Property(property: 'country', type: 'string', example: 'ES'),
                            new OA\Property(property: 'city', type: 'string', example: 'Madrid'),
                            new OA\Property(property: 'zipcode', type: 'string', example: '28001'),
                            new OA\Property(property: 'address', type: 'string', example: 'Calle Mayor 1'),
                            new OA\Property(property: 'language', type: 'string', example: 'Español'),
                            new OA\Property(property: 'about', type: 'string', example: 'Especialista profesional con más de 10 años de experiencia.'),
                            new OA\Property(property: 'phone', type: 'string', example: '+34600112233'),
                            new OA\Property(property: 'account_number', type: 'string', example: 'ES12345678901234567890'),
                            new OA\Property(property: 'holder_name', type: 'string', example: 'Abel Mena'),
                            new OA\Property(property: 'bank_name', type: 'string', example: 'Banco Santander'),
                            new OA\Property(property: 'consult_price', type: 'number', example: 50),
                            new OA\Property(property: 'consult_time', type: 'integer', example: 45),
                            new OA\Property(property: 'consult_type', type: 'string', enum: ['presential', 'virtual', 'hybrid'], example: 'virtual'),
                            new OA\Property(property: 'base_profession_uid', type: 'string', nullable: true),
                            new OA\Property(property: 'main_specialty_uid', type: 'string', nullable: true),
                            new OA\Property(property: 'short_description', type: 'string', example: 'Expertos en terapias alternativas'),
                            new OA\Property(property: 'professional_info', type: 'string', example: 'Detalles sobre mi trayectoria profesional...'),
                            new OA\Property(property: 'policies', type: 'boolean', example: true),
                        ]),
                        new OA\Property(property: 'studies', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'uid', type: 'string', nullable: true),
                            new OA\Property(property: 'name', type: 'string', example: 'Grado en Psicología'),
                            new OA\Property(property: 'institute', type: 'string', example: 'Universidad de Barcelona'),
                            new OA\Property(property: 'type', type: 'string', example: 'higher_education'),
                            new OA\Property(property: 'date_start', type: 'string', format: 'date', example: '2010-09-01'),
                            new OA\Property(property: 'date_end', type: 'string', format: 'date', example: '2014-06-30'),
                            new OA\Property(property: 'delete', type: 'boolean', example: false)
                        ]))
                    ]
                ),
                new OA\MediaType(
                    mediaType: 'multipart/form-data',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'first_name', type: 'string', example: 'Abel'),
                            new OA\Property(property: 'last_name', type: 'string', example: 'Mena'),
                            new OA\Property(property: 'dni', type: 'string', example: '12345678X'),
                            new OA\Property(property: 'type_account', type: 'string', enum: ['professional', 'patient'], example: 'professional'),
                            new OA\Property(property: 'msp_number', type: 'string', example: 'MSP-54321'),
                            new OA\Property(property: 'details[date_birth]', type: 'string', example: '1990-01-01'),
                            new OA\Property(property: 'details[gender]', type: 'string', example: 'male'),
                            new OA\Property(property: 'details[country]', type: 'string', example: 'ES'),
                            new OA\Property(property: 'details[city]', type: 'string', example: 'Madrid'),
                            new OA\Property(property: 'details[zipcode]', type: 'string', example: '28001'),
                            new OA\Property(property: 'details[address]', type: 'string', example: 'Calle Mayor 1'),
                            new OA\Property(property: 'details[language]', type: 'string', example: 'Español'),
                            new OA\Property(property: 'details[about]', type: 'string', example: 'Especialista profesional con más de 10 años de experiencia.'),
                            new OA\Property(property: 'details[phone]', type: 'string', example: '+34600112233'),
                            new OA\Property(property: 'details[account_number]', type: 'string', example: 'ES12345678901234567890'),
                            new OA\Property(property: 'details[holder_name]', type: 'string', example: 'Abel Mena'),
                            new OA\Property(property: 'details[bank_name]', type: 'string', example: 'Banco Santander'),
                            new OA\Property(property: 'details[consult_price]', type: 'number', example: 50),
                            new OA\Property(property: 'details[consult_time]', type: 'integer', example: 45),
                            new OA\Property(property: 'details[consult_type]', type: 'string', example: 'virtual'),
                            new OA\Property(property: 'details[base_profession_uid]', type: 'string', example: '91bebc89-2ced-43a3-ba41-7188aeb7add8'),
                            new OA\Property(property: 'details[main_specialty_uid]', type: 'string', example: '8f7e9d1c-2ced-43a3-ba41-7188aeb7add8'),
                            new OA\Property(property: 'details[short_description]', type: 'string', example: 'Expertos en terapias alternativas'),
                            new OA\Property(property: 'details[professional_info]', type: 'string', example: 'Detalles sobre mi trayectoria profesional...'),
                            new OA\Property(property: 'details[policies]', type: 'boolean', example: true),
                            new OA\Property(property: 'details[image]', type: 'string', format: 'binary'),
                            new OA\Property(property: 'details[banner_image]', type: 'string', format: 'binary'),
                            new OA\Property(property: 'studies[0][uid]', type: 'string', example: '227b0c0d-6b85-42d4-b456-382470b0e351'),
                            new OA\Property(property: 'studies[0][name]', type: 'string', example: 'Grado en Psicología'),
                            new OA\Property(property: 'studies[0][institute]', type: 'string', example: 'Universidad de Barcelona'),
                            new OA\Property(property: 'studies[0][type]', type: 'string', example: 'higher_education'),
                            new OA\Property(property: 'studies[0][date_start]', type: 'string', example: '2010-09-01'),
                            new OA\Property(property: 'studies[0][date_end]', type: 'string', example: '2014-06-30'),
                            new OA\Property(property: 'studies[0][specialty_uid]', type: 'string', example: '8f7e9d1c-2ced-43a3-ba41-7188aeb7add8'),
                            new OA\Property(property: 'studies[0][delete]', type: 'boolean', example: false),
                            new OA\Property(property: 'studies[0][url_certificate]', type: 'string', format: 'binary')
                        ]
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(response: 200, description: 'Perfil actualizado'),
            new OA\Response(response: 401, description: 'No autorizado')
        ]
    )]
    #[OA\Patch(
        path: '/api/profile',
        summary: 'Actualizar perfil del usuario autenticado (PATCH)',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: [
                new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'first_name', type: 'string', example: 'Abel'),
                        new OA\Property(property: 'last_name', type: 'string', example: 'Mena'),
                        new OA\Property(property: 'dni', type: 'string', example: '12345678X'),
                        new OA\Property(property: 'type_account', type: 'string', enum: ['professional', 'patient'], example: 'professional'),
                        new OA\Property(property: 'msp_number', type: 'string', example: 'MSP-54321'),
                        new OA\Property(property: 'details', type: 'object', properties: [
                            new OA\Property(property: 'date_birth', type: 'string', format: 'date', example: '1990-01-01'),
                            new OA\Property(property: 'gender', type: 'string', example: 'male'),
                            new OA\Property(property: 'country', type: 'string', example: 'ES'),
                            new OA\Property(property: 'city', type: 'string', example: 'Madrid'),
                            new OA\Property(property: 'zipcode', type: 'string', example: '28001'),
                            new OA\Property(property: 'address', type: 'string', example: 'Calle Mayor 1'),
                            new OA\Property(property: 'language', type: 'string', example: 'Español'),
                            new OA\Property(property: 'about', type: 'string', example: 'Especialista profesional con más de 10 años de experiencia.'),
                            new OA\Property(property: 'phone', type: 'string', example: '+34600112233'),
                            new OA\Property(property: 'account_number', type: 'string', example: 'ES12345678901234567890'),
                            new OA\Property(property: 'holder_name', type: 'string', example: 'Abel Mena'),
                            new OA\Property(property: 'bank_name', type: 'string', example: 'Banco Santander'),
                            new OA\Property(property: 'consult_price', type: 'number', example: 50),
                            new OA\Property(property: 'consult_time', type: 'integer', example: 45),
                            new OA\Property(property: 'consult_type', type: 'string', enum: ['presential', 'virtual', 'hybrid'], example: 'virtual'),
                            new OA\Property(property: 'base_profession_uid', type: 'string', nullable: true),
                            new OA\Property(property: 'main_specialty_uid', type: 'string', nullable: true),
                            new OA\Property(property: 'short_description', type: 'string', example: 'Expertos en terapias alternativas'),
                            new OA\Property(property: 'professional_info', type: 'string', example: 'Detalles sobre mi trayectoria profesional...'),
                            new OA\Property(property: 'policies', type: 'boolean', example: true),
                        ]),
                        new OA\Property(property: 'studies', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'uid', type: 'string', nullable: true),
                            new OA\Property(property: 'name', type: 'string', example: 'Grado en Psicología'),
                            new OA\Property(property: 'institute', type: 'string', example: 'Universidad de Barcelona'),
                            new OA\Property(property: 'type', type: 'string', example: 'higher_education'),
                            new OA\Property(property: 'date_start', type: 'string', format: 'date', example: '2010-09-01'),
                            new OA\Property(property: 'date_end', type: 'string', format: 'date', example: '2014-06-30'),
                            new OA\Property(property: 'delete', type: 'boolean', example: false)
                        ]))
                    ]
                ),
                new OA\MediaType(
                    mediaType: 'multipart/form-data',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'first_name', type: 'string', example: 'Abel'),
                            new OA\Property(property: 'last_name', type: 'string', example: 'Mena'),
                            new OA\Property(property: 'dni', type: 'string', example: '12345678X'),
                            new OA\Property(property: 'type_account', type: 'string', enum: ['professional', 'patient'], example: 'professional'),
                            new OA\Property(property: 'msp_number', type: 'string', example: 'MSP-54321'),
                            new OA\Property(property: 'details[date_birth]', type: 'string', example: '1990-01-01'),
                            new OA\Property(property: 'details[gender]', type: 'string', example: 'male'),
                            new OA\Property(property: 'details[country]', type: 'string', example: 'ES'),
                            new OA\Property(property: 'details[city]', type: 'string', example: 'Madrid'),
                            new OA\Property(property: 'details[zipcode]', type: 'string', example: '28001'),
                            new OA\Property(property: 'details[address]', type: 'string', example: 'Calle Mayor 1'),
                            new OA\Property(property: 'details[language]', type: 'string', example: 'Español'),
                            new OA\Property(property: 'details[about]', type: 'string', example: 'Especialista profesional con más de 10 años de experiencia.'),
                            new OA\Property(property: 'details[phone]', type: 'string', example: '+34600112233'),
                            new OA\Property(property: 'details[account_number]', type: 'string', example: 'ES12345678901234567890'),
                            new OA\Property(property: 'details[holder_name]', type: 'string', example: 'Abel Mena'),
                            new OA\Property(property: 'details[bank_name]', type: 'string', example: 'Banco Santander'),
                            new OA\Property(property: 'details[consult_price]', type: 'number', example: 50),
                            new OA\Property(property: 'details[consult_time]', type: 'integer', example: 45),
                            new OA\Property(property: 'details[consult_type]', type: 'string', example: 'virtual'),
                            new OA\Property(property: 'details[base_profession_uid]', type: 'string', example: '91bebc89-2ced-43a3-ba41-7188aeb7add8'),
                            new OA\Property(property: 'details[main_specialty_uid]', type: 'string', example: '8f7e9d1c-2ced-43a3-ba41-7188aeb7add8'),
                            new OA\Property(property: 'details[short_description]', type: 'string', example: 'Expertos en terapias alternativas'),
                            new OA\Property(property: 'details[professional_info]', type: 'string', example: 'Detalles sobre mi trayectoria profesional...'),
                            new OA\Property(property: 'details[policies]', type: 'boolean', example: true),
                            new OA\Property(property: 'details[image]', type: 'string', format: 'binary'),
                            new OA\Property(property: 'details[banner_image]', type: 'string', format: 'binary'),
                            new OA\Property(property: 'studies[0][uid]', type: 'string', example: '227b0c0d-6b85-42d4-b456-382470b0e351'),
                            new OA\Property(property: 'studies[0][name]', type: 'string', example: 'Grado en Psicología'),
                            new OA\Property(property: 'studies[0][institute]', type: 'string', example: 'Universidad de Barcelona'),
                            new OA\Property(property: 'studies[0][type]', type: 'string', example: 'higher_education'),
                            new OA\Property(property: 'studies[0][date_start]', type: 'string', example: '2010-09-01'),
                            new OA\Property(property: 'studies[0][date_end]', type: 'string', example: '2014-06-30'),
                            new OA\Property(property: 'studies[0][specialty_uid]', type: 'string', example: '8f7e9d1c-2ced-43a3-ba41-7188aeb7add8'),
                            new OA\Property(property: 'studies[0][delete]', type: 'boolean', example: false),
                            new OA\Property(property: 'studies[0][url_certificate]', type: 'string', format: 'binary')
                        ]
                    )
                )
            ]
        ),
        responses: [
            new OA\Response(response: 200, description: 'Perfil actualizado'),
            new OA\Response(response: 401, description: 'No autorizado')
        ]
    )]
    public function updateUser(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        /** 
         * @var AppUser $user 
         * */
        $user = $this->getUser();
        if (!$user) {
            return $this->error('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }

        $contentType = strtolower($request->headers->get('Content-Type', ''));
        $isJson = str_contains($contentType, 'json');

        if ($isJson) {
            $formData = ['fields' => $request->toArray(), 'files' => []];
        } elseif ($request->isMethod('POST')) {
            $formData = ['fields' => $request->request->all(), 'files' => $request->files->all()];
        } else {

            $formData = $this->parseMultipartRequest($request);
        }

        try {
            $this->userService->updateProfile($user, $formData);
            $entityManager->flush();

            if ($this->userService->isProfileComplete($user)) {
                if ($user->getStatus() === UserStatusEnum::PENDING_COMPLETION->value) {
                    $user->setStatus(UserStatusEnum::PENDING_APPROVAL->value);
                    $entityManager->persist($user);
                    $entityManager->flush();
                }
            }

            return $this->json([
                'code' => Response::HTTP_OK,
                'message' =>
                'Profile updated'
            ], Response::HTTP_OK);
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), Response::HTTP_NOT_FOUND);
        } catch (\RuntimeException $e) {
            $code = $e->getCode();
            $status = (is_int($code) && $code >= 400 && $code <= 599) ? $code : Response::HTTP_BAD_REQUEST;
            return $this->error($e->getMessage(), $status);
        } catch (\Throwable $e) {
            return $this->error('Error interno del servidor.', Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    #[OA\Tag(name: 'User Profile')]
    #[Route(path: '/profile/{uid}/professions', name: 'api_user_professions', methods: ['GET'])]
    public function getUserProfessions(string $uid): JsonResponse
    {
        $user = $this->userRepository->findOneBy(['uid' => $uid]);
        if (!$user) {
            return $this->error('No autorizado o recurso no disponible.', Response::HTTP_NOT_FOUND);
        }

        $profile = $this->userService->serializeProfile($user);
        return $this->json(['professions' => $profile['professions']], Response::HTTP_OK);
    }

    #[OA\Tag(name: 'User Profile')]
    #[Route(path: '/profile/{uid}/studies', name: 'api_user_studies', methods: ['GET'])]
    public function getUserStudies(string $uid): JsonResponse
    {
        $user = $this->userRepository->findOneBy(['uid' => $uid]);
        if (!$user) {
            return $this->error('No autorizado o recurso no disponible.', Response::HTTP_NOT_FOUND);
        }

        $profile = $this->userService->serializeProfile($user);
        return $this->json(['studies' => $profile['studies']], Response::HTTP_OK);
    }

    #[OA\Tag(name: 'User Profile')]
    #[Route(path: '/api/me', name: 'api_me', methods: ['GET'])]
    #[OA\Get(
        path: '/api/me',
        summary: 'Obtener información del usuario autenticado',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Información del usuario'),
            new OA\Response(response: 401, description: 'No autorizado')
        ]
    )]
    public function me(Request $request): JsonResponse
    {
        /**
         *  @var AppUser $user
         */
        $user = $this->getUser();

        if (!$user) {
            return $this->error('No autorizado o recurso no disponible.', Response::HTTP_UNAUTHORIZED);
        }

        $data = $this->userService->serializeProfile($user);
        $data['uid'] = $user->getUid();

        return $this->json($data, Response::HTTP_OK);
    }

    #[OA\Tag(name: 'User Profile')]
    #[Route(path: '/api/profile/status', name: 'api_profile_status', methods: ['GET'])]
    #[OA\Get(
        path: '/api/profile/status',
        summary: 'Obtener estado y tipo de cuenta del perfil',
        security: [['Bearer' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Estado del perfil'),
            new OA\Response(response: 401, description: 'No autorizado')
        ]
    )]
    public function getStatus(): JsonResponse
    {
        /** @var AppUser $user */
        $user = $this->getUser();

        if (!$user) {
            return $this->error('No autorizado.', Response::HTTP_UNAUTHORIZED);
        }

        $response = [
            'status' => $user->getStatus(),
            'type_account' => $user->getTypeAccount(),
        ];

        return $this->json($response, Response::HTTP_OK);
    }

    #[OA\Tag(name: 'User Profile')]
    #[Route('/api/profile/patient', methods: ['POST', 'PUT', 'PATCH'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        path: '/api/profile/patient',
        summary: 'Actualizar perfil de paciente (POST)',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'first_name', type: 'string', example: 'Pedro'),
                        new OA\Property(property: 'last_name', type: 'string', example: 'Leon'),
                        new OA\Property(property: 'dni', type: 'string', example: '22547145'),
                        new OA\Property(property: 'date_birth', type: 'string', format: 'date', example: '1992-03-10'),
                        new OA\Property(property: 'phone', type: 'string', example: '+34 600000001'),
                        new OA\Property(property: 'gender', type: 'string', enum: ['male', 'female', 'other'], example: 'female'),
                        new OA\Property(property: 'zipcode', type: 'string', example: '28001'),
                        new OA\Property(property: 'address', type: 'string', example: 'C/ Alcala 123'),
                        new OA\Property(property: 'city', type: 'string', example: 'Madrid'),
                        new OA\Property(property: 'country', type: 'string', example: 'VE'),
                        new OA\Property(property: 'medical_condition', type: 'string', example: '<p><strong>Diagnóstico200:</strong> Asma moderada persistente</p>'),
                        new OA\Property(property: 'about', type: 'string', example: 'Descripcion normal'),
                        new OA\Property(property: 'profile_image', type: 'string', format: 'binary')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Perfil de paciente actualizado'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 500, description: 'Error interno')
        ]
    )]
    #[OA\Put(
        path: '/api/profile/patient',
        summary: 'Actualizar perfil de paciente (PUT)',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'first_name', type: 'string', example: 'Pedro'),
                        new OA\Property(property: 'last_name', type: 'string', example: 'Leon'),
                        new OA\Property(property: 'dni', type: 'string', example: '22547145'),
                        new OA\Property(property: 'date_birth', type: 'string', format: 'date', example: '1992-03-10'),
                        new OA\Property(property: 'phone', type: 'string', example: '+34 600000001'),
                        new OA\Property(property: 'gender', type: 'string', enum: ['male', 'female', 'other'], example: 'female'),
                        new OA\Property(property: 'zipcode', type: 'string', example: '28001'),
                        new OA\Property(property: 'address', type: 'string', example: 'C/ Alcala 123'),
                        new OA\Property(property: 'city', type: 'string', example: 'Madrid'),
                        new OA\Property(property: 'country', type: 'string', example: 'VE'),
                        new OA\Property(property: 'medical_condition', type: 'string', example: '<p><strong>Diagnóstico200:</strong> Asma moderada persistente</p>'),
                        new OA\Property(property: 'about', type: 'string', example: 'Descripcion normal'),
                        new OA\Property(property: 'profile_image', type: 'string', format: 'binary')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Perfil de paciente actualizado'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 500, description: 'Error interno')
        ]
    )]
    #[OA\Patch(
        path: '/api/profile/patient',
        summary: 'Actualizar perfil de paciente (PATCH)',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'first_name', type: 'string', example: 'Pedro'),
                        new OA\Property(property: 'last_name', type: 'string', example: 'Leon'),
                        new OA\Property(property: 'dni', type: 'string', example: '22547145'),
                        new OA\Property(property: 'date_birth', type: 'string', format: 'date', example: '1992-03-10'),
                        new OA\Property(property: 'phone', type: 'string', example: '+34 600000001'),
                        new OA\Property(property: 'gender', type: 'string', enum: ['male', 'female', 'other'], example: 'female'),
                        new OA\Property(property: 'zipcode', type: 'string', example: '28001'),
                        new OA\Property(property: 'address', type: 'string', example: 'C/ Alcala 123'),
                        new OA\Property(property: 'city', type: 'string', example: 'Madrid'),
                        new OA\Property(property: 'country', type: 'string', example: 'VE'),
                        new OA\Property(property: 'medical_condition', type: 'string', example: '<p><strong>Diagnóstico200:</strong> Asma moderada persistente</p>'),
                        new OA\Property(property: 'about', type: 'string', example: 'Descripcion normal'),
                        new OA\Property(property: 'profile_image', type: 'string', format: 'binary')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Perfil de paciente actualizado'),
            new OA\Response(response: 401, description: 'No autorizado'),
            new OA\Response(response: 500, description: 'Error interno')
        ]
    )]
    public function updatePatientProfile(
        Request $request
    ): JsonResponse {
        /**
         * @var AppUser $user
         */

        $user = $this->security->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Token inválido o usuario no autenticado'], Response::HTTP_UNAUTHORIZED);
        }

        if (!$request->isMethod('POST') && str_contains(strtolower($request->headers->get('Content-Type', '')), 'multipart/form-data')) {
            $this->parseMultipartRequest($request);
        }

        $dto = UpdatePatientProfileDto::fromRequest($request);
        $uploaded = $request->files->get('profile_image');

        $updateProfile = $this->patientProfileService->updateProfile($user, $dto, $uploaded);

        if (!$updateProfile) {
            return new JsonResponse(['error' => 'No se pudo actualizar el perfil'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json(['code' => Response::HTTP_OK, 'message' => 'Profile updated'], Response::HTTP_OK);
    }

    #[OA\Tag(name: 'User Profile')]
    #[Route('/api/upload-photo', methods: ['POST'])]
    #[OA\Post(
        path: '/api/upload-photo',
        summary: 'Subir una foto',
        security: [['Bearer' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'photo', type: 'string', format: 'binary')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Imagen subida correctamente'),
            new OA\Response(response: 400, description: 'No se ha subido ningún archivo')
        ]
    )]
    public function uploadPhoto(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $file = $request->files->get('photo');

        if (!$file) {
            return new JsonResponse(['error' => 'No se ha subido ningún archivo'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $uploadsDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
        $fileName = uniqid() . '.' . $file->guessExtension();
        $file->move($uploadsDir, $fileName);

        $user = $this->getUser();
        if ($user) {
            $entityManager->persist($user);
            $entityManager->flush();
        }

        return new JsonResponse([
            'message' => 'Imagen subida correctamente',
            'photoUrl' => '/uploads/' . $fileName
        ], JsonResponse::HTTP_OK);
    }

    #[OA\Tag(name: 'User Profile')]
    #[Route('/api/{uid_patient}/patient-profile', name: 'api_patient_profile', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        path: '/api/{uid_patient}/patient-profile',
        summary: 'Obtener perfil de paciente (solo para profesionales)',
        security: [['Bearer' => []]],
        parameters: [
            new OA\Parameter(name: 'uid_patient', in: 'path', required: true, description: 'UID del paciente', schema: new OA\Schema(type: 'string'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Perfil del paciente'),
            new OA\Response(response: 403, description: 'Prohibido (solo profesionales)'),
            new OA\Response(response: 404, description: 'Paciente no encontrado')
        ]
    )]
    public function getPatientProfile(string $uid_patient): JsonResponse
    {
        /** 
         * @var AppUser|null $currentUser 
         */
        $currentUser = $this->getUser();

        if (!$currentUser) {
            return $this->error('No autorizado o recurso no disponible.', Response::HTTP_UNAUTHORIZED);
        }

        if ($currentUser->getTypeAccount() !== 'professional') {
            return $this->error('Solo los profesionales pueden consultar el perfil de un consultante.', Response::HTTP_FORBIDDEN);
        }

        $patient = $this->userRepository->findOneBy(['uid' => $uid_patient]);
        if (!$patient) {
            return $this->error('Consultante no encontrado.', Response::HTTP_NOT_FOUND);
        }

        try {
            $profileData = $this->userService->getPatientProfileForProfessional($currentUser, $patient);
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), Response::HTTP_BAD_REQUEST);
        }

        return $this->json($profileData, Response::HTTP_OK);
    }

    private function parseMultipartRequest(Request $request): array
    {
        $input = $request->getContent();
        if (empty($input)) {
            return ['fields' => [], 'files' => []];
        }

        $contentType = $request->headers->get('Content-Type');
        if (!preg_match('/boundary=(.*)$/', $contentType, $matches)) {
            return ['fields' => $request->request->all(), 'files' => $request->files->all()];
        }
        $boundary = $matches[1];

        $blocks = preg_split("/-+" . preg_quote($boundary, '/') . "/", $input);
        array_pop($blocks);

        $fields = [];
        $files = [];

        foreach ($blocks as $block) {
            if (empty($block) || $block === "--\r\n") continue;

            if (strpos($block, 'application/octet-stream') !== false || strpos($block, 'filename=') !== false) {
                preg_match('/name=\"([^\"]*)\"; filename=\"([^\"]*)\"/', $block, $matches);
                $name = $matches[1] ?? null;
                $filename = $matches[2] ?? null;

                if ($name && $filename) {
                    $start = strpos($block, "\r\n\r\n") + 4;
                    $end = strrpos($block, "\r\n");
                    $content = substr($block, $start, $end - $start);

                    $tmpPath = tempnam(sys_get_temp_dir(), 'php_multipart_');
                    file_put_contents($tmpPath, $content);

                    $uploadedFile = new UploadedFile(
                        $tmpPath,
                        $filename,
                        null,
                        null,
                        true
                    );

                    $this->assignNestedValue($files, $name, $uploadedFile);
                }
            } else {
                preg_match('/name=\"([^\"]*)\"/', $block, $matches);
                $name = $matches[1] ?? null;

                if ($name) {
                    $start = strpos($block, "\r\n\r\n") + 4;
                    $end = strrpos($block, "\r\n");
                    $value = substr($block, $start, $end - $start);
                    $this->assignNestedValue($fields, $name, $value);
                }
            }
        }

        $request->request->add($fields);
        $request->files->add($files);

        return ['fields' => $fields, 'files' => $files];
    }

    private function assignNestedValue(array &$array, string $name, mixed $value): void
    {
        $isArray = str_ends_with($name, '[]');
        $parts = preg_split('/[\[\]]+/', $name, -1, PREG_SPLIT_NO_EMPTY);
        $temp = &$array;

        $count = count($parts);
        for ($i = 0; $i < $count; $i++) {
            $part = $parts[$i];

            if ($i === $count - 1) {
                if ($isArray) {
                    if (!isset($temp[$part]) || !is_array($temp[$part])) {
                        $temp[$part] = [];
                    }
                    $temp[$part][] = $value;
                } else {
                    $temp[$part] = $value;
                }
            } else {
                if (!isset($temp[$part]) || !is_array($temp[$part])) {
                    $temp[$part] = [];
                }
                $temp = &$temp[$part];
            }
        }
    }
}
