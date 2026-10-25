<?php

namespace App\Services;

use App\Entity\User;
use App\Repository\BookingRepository;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;
use App\Utils\Sanitizer;
use DateTimeInterface;
use App\Enum\StudyType;
use App\Entity\Studies;
use App\Entity\UserDetails;
use App\Utils\FileUploadUtil;
use App\Enum\LatamCountryEnum;
use App\Enum\ConsultTypeEnum;
use App\Repository\StudiesRepository;
use App\Entity\Dimension;
use App\Entity\Specialty;
use App\Repository\SpecialtyRepository;
use App\Repository\DimensionRepository;
use App\Entity\Profession;
use App\Enum\UserStatusEnum;
use App\Repository\ProfessionRepository;
use App\Repository\UserDetailsRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserService
{
    public function isProfileComplete(User $user): bool
    {
        if (
            empty($user->getFirstName()) ||
            empty($user->getLastName()) ||
            empty($user->getDni()) ||
            (empty($user->getPhoneNumber()) && empty($user->getUserDetails()?->getPhone()))
        ) {
            return false;
        }

        $details = $user->getUserDetails();
        if (!$details) {
            return false;
        }

        if (!$details->getDateBirth()) {
            return false;
        }

        if (
            empty($details->getAccountNumber()) ||
            empty($details->getHolderName()) ||
            empty($details->getBankName())
        ) {
            return false;
        }

        if (!$details->getBaseProfession()) {
            return false;
        }

        if ($user->getSpecialties()->count() === 0) {
            return false;
        }

        if ($user->getStudies()->count() === 0) {
            return false;
        }

        return true;
    }

    public function __construct(
        private StudiesRepository $studyRepo,
        private ProfessionRepository $profRepo,
        private SpecialtyRepository $specialtyRepo,
        private DimensionRepository $dimensionRepo,
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private ValidatorInterface $validator,
        private FileUploadUtil $fileUploadUtil,
        private UserDetailsRepository $userDetailsRepository,
        private LoggerInterface $logger,
        private Sanitizer $sanitizer,
        private BookingRepository $bookingRepository,
    ) {}

    public function serializeForList(User $user): array
    {
        $details = $user->getUserDetails();
        $base = $details?->getBaseProfession();

        return [
            'email' => $this->sanitizer->outEmail($user->getEmail()),
            'first_name' => $this->sanitizer->outText($user->getFirstName()),
            'last_name' => $this->sanitizer->outText($user->getLastName()),
            'is_active' => $user->isActive(),
            'status' => $this->sanitizer->outText($user->getStatus()),
            'uid' => $user->getUid(),
            'type_account' => $user->getTypeAccount(),
            'base_profession' => $base?->getUid(),
            'name' => $this->sanitizer->outText($base?->getName()),
            'image' => $this->sanitizer->outUrl($details?->getImage()),
            'short_description' => $this->sanitizer->outMultiline($details?->getShortDescription()),
            'banner_image' => $this->sanitizer->outUrl($details?->getBannerImage()),
            'prefix_professional' => $this->sanitizer->outText($details?->getPrefixProfessional()),
            'profile_media_type' => $this->sanitizer->outText($details?->getProfileMediaType()),
            'profile_video_url' => $this->sanitizer->outUrl($details?->getProfileVideoUrl()),
        ];
    }

    public function serializeProfile(User $user): array
    {
        $profile = [
            'email' => $this->sanitizer->outEmail($user->getEmail()),
            'username' => $this->sanitizer->outText($user->getUsername()),
            'first_name' => $this->sanitizer->outText($user->getFirstName()),
            'last_name' => $this->sanitizer->outText($user->getLastName()),
            'type_account' => $user->getTypeAccount(),
            'dni' => $user->getDni(),
            'status' => $user->getStatus(),
        ];

        if ($details = $user->getUserDetails()) {
            $base = $details->getBaseProfession();

            $profile['details'] = [
                'image' => $this->sanitizer->outUrl($details->getImage()),
                'date_birth' => $this->formatDate($details->getDateBirth()),
                'gender' => $this->sanitizer->outText($details->getGender()),
                'country' => ($cEnum = LatamCountryEnum::tryFrom((string) $details?->getCountry())) ? [
                    'code' => $cEnum->value,
                    'name' => $cEnum->label(),
                ] : null,
                'city' => $this->sanitizer->outText($details->getCity()),
                'zipcode' => $this->sanitizer->outText($details->getZipcode()),
                'address' => $this->sanitizer->outText($details->getAddress()),
                'language' => $this->sanitizer->outText($details->getLanguage()),
                'about' => $this->sanitizer->outRich($details->getAbout()),
                'phone' => $this->sanitizer->outPhone($details->getPhone()),
                'account_number' => $this->sanitizer->outText($details->getAccountNumber()),
                'holder_name' => $this->sanitizer->outText($details->getHolderName()),
                'bank_name' => $this->sanitizer->outText($details->getBankName()),
                'policies' => $details->isPolicies(),
                'medical_condition' => $details->getMedicalCondition(),
                'consult_price' => $details->getConsultPrice(),
                'consult_time' => $details->getConsultTime(),
                'consult_type' => ConsultTypeEnum::tryFrom((string) $details->getConsultType())?->label(),
                'msp_number' => $user->getMspNumber(),
                'is_msp_verified' => $user->getMspVerificationStatus() === 'VERIFIED',
                'base_profession' => $base ? [
                    'uid' => $base->getUid(),
                    'name' => $this->getProfessionNameByGender($base, $user),
                ] : null,
                'main_specialty' => ($ms = $details->getMainSpecialty()) ? [
                    'uid' => $ms->getUid(),
                    'name' => $this->getSpecialtyNameByGender($ms, $user),
                    'nombre' => $ms->getName(),
                    'titulo_masculino' => $ms->getPublicTitleMale(),
                    'titulo_femenino' => $ms->getPublicTitleFemale(),
                    'titulo_neutro' => $ms->getPublicTitleNeutral(),
                ] : null,
                'short_description' => $this->sanitizer->outMultiline($details->getShortDescription()),
                'banner_image' => $this->sanitizer->outUrl($details->getBannerImage()),
                'professional_info' => $this->sanitizer->outRich($details->getProfessionalInfo()),
                'profile_media_type' => $this->sanitizer->outText($details->getProfileMediaType()),
                'profile_video_url' => $this->sanitizer->outUrl($details->getProfileVideoUrl()),
            ];
        } else {
            $profile['details'] = [];
        }

        $studies = $user->getStudies()->toArray();
        usort($studies, function ($a, $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        $profile['studies'] = array_map(fn($s) => [
            'uid' => $s->getUid(),
            'name' => $this->sanitizer->outText($s->getName()),
            'institute' => $this->sanitizer->outText($s->getInstitute()),
            'type' => [
                'code' => $this->sanitizer->outText($s->getType()),
                'label' => StudyType::tryFrom((string) $s->getType())?->label(),
            ],
            'date_start' => $this->formatDate($s->getDateStart()),
            'date_end' => $this->formatDate($s->getDateEnd()),
            'url_certificate' => $this->sanitizer->outUrl($s->getUrlCertificate()),
            'specialty' => $s->getSpecialty() ? [
                'uid' => $s->getSpecialty()->getUid(),
                'name' => $s->getSpecialty()->getName(),
                'requires_msp' => $s->getSpecialty()->isMspRequired(),
            ] : null,
        ], $studies);

        return $profile;
    }

    /**
     * @return array{ user?: User }
     * @throws \RuntimeException
     * @throws \InvalidArgumentException
     */
    public function updateProfile(User $user, array $data): array
    {
        $fields = $data['fields'] ?? [];
        $files = $data['files'] ?? [];

        if (isset($fields['type_account']) && is_string($fields['type_account'])) {
            $fields['type_account'] = strtolower(trim($fields['type_account']));
            $data['fields']['type_account'] = $fields['type_account'];
        }

        $detailsIn = $data['fields']['details'] ?? null;
        if (is_array($detailsIn)) {
            $rawPolicies = $detailsIn['policies'] ?? null;
            $data['fields']['details']['policies'] = filter_var(
                $rawPolicies,
                FILTER_VALIDATE_BOOLEAN,
                FILTER_NULL_ON_FAILURE
            );
        }



        if (isset($data['fields']['studies']) && is_array($data['fields']['studies'])) {
            foreach ($data['fields']['studies'] as $k => $item) {
                if (!is_array($item))
                    continue;

                if (array_key_exists('delete', $item)) {
                    $data['fields']['studies'][$k]['delete'] = filter_var(
                        $item['delete'],
                        FILTER_VALIDATE_BOOLEAN,
                        FILTER_NULL_ON_FAILURE
                    );
                }


                if (isset($item['type'])) {
                    $enum = StudyType::fromMixed(is_string($item['type']) ? $item['type'] : null);
                    if ($enum) {
                        $data['fields']['studies'][$k]['type'] = $enum->value;
                    }
                }
            }
        }

        if (isset($data['fields']['professions']) && is_array($data['fields']['professions'])) {
            foreach ($data['fields']['professions'] as $k => $item) {
                if (is_array($item) && array_key_exists('delete', $item)) {
                    $data['fields']['professions'][$k]['delete'] = filter_var(
                        $item['delete'],
                        FILTER_VALIDATE_BOOLEAN,
                        FILTER_NULL_ON_FAILURE
                    );
                }
            }
        }

        $policiesAlreadyAccepted = ($user->getUserDetails()?->isPolicies() === true);

        try {
            $detailsFields = [
                'image' => new Assert\Optional(new Assert\Url()),
                'banner_image' => new Assert\Optional(new Assert\Url()),
                'date_birth' => new Assert\Optional(new Assert\Date()),
                'gender' => new Assert\Optional(),
                'account_number' => new Assert\Optional(),
                'holder_name' => new Assert\Optional(),
                'bank_name' => new Assert\Optional(),
                'country' => new Assert\Optional(),
                'city' => new Assert\Optional(),
                'zipcode' => new Assert\Optional(),
                'address' => new Assert\Optional(),
                'language' => new Assert\Optional(),
                'about' => new Assert\Optional(),
                'professional_info' => new Assert\Optional(),
                'prefix_professional' => new Assert\Optional(new Assert\Length(['max' => 20])),
                'phone' => new Assert\Optional(),
                'time_availability' => new Assert\Optional(),
                'policies' => $policiesAlreadyAccepted
                    ? new Assert\Optional(new Assert\Type('bool'))
                    : new Assert\Required([new Assert\Type('bool')]),
                'medical_condition' => new Assert\Optional(),
                'consult_type' => new Assert\Optional([
                    new Assert\Choice(callback: [ConsultTypeEnum::class, 'values']),
                ]),
                'consult_time' => new Assert\Optional([new Assert\Type('numeric'), new Assert\Positive()]),
                'consult_price' => new Assert\Optional([new Assert\Type('numeric'), new Assert\Positive()]),
                'base_profession_uid' => new Assert\Optional(new Assert\Uuid()),
                'main_specialty_uid' => new Assert\Optional(new Assert\Uuid()),
                'short_description' => new Assert\Optional(new Assert\Length(['max' => 2000])),
                'profile_media_type' => new Assert\Optional(new Assert\Choice(['choices' => ['image', 'video']])),
                'profile_video_url' => new Assert\Optional([
                    new Assert\Length(['max' => 500]),
                    new Assert\Url(),
                ]),
            ];

            $constraints = new Assert\Collection(
                fields: [
                    'fields' => new Assert\Collection(
                        fields: [
                            'first_name' => new Assert\Optional(new Assert\Length(['min' => 2])),
                            'last_name' => new Assert\Optional(new Assert\Length(['min' => 2])),
                            'password' => new Assert\Optional(new Assert\Length(['min' => 8])),
                            'type_account' => new Assert\Optional(new Assert\Choice([
                                'choices' => ['patient', 'professional'],
                                'message' => 'El valor seleccionado no es una opción válida.',
                            ])),
                            'dni' => new Assert\Optional(),
                            'phone_number' => new Assert\Optional(),
                            'phone' => new Assert\Optional(),
                            'msp_number' => new Assert\Optional(),
                            'specialties' => new Assert\Optional(new Assert\All([
                                new Assert\Uuid()
                            ])),
                            'details' => new Assert\Optional(new Assert\Collection(
                                fields: $detailsFields,
                                allowExtraFields: false,
                                allowMissingFields: true,
                                missingFieldsMessage: 'Falta el campo requerido: {{ field }}',
                                extraFieldsMessage: 'Campo no permitido: {{ field }}'
                            )),
                            'professions' => new Assert\Optional(
                                new Assert\All([
                                    new Assert\AtLeastOneOf([
                                        'constraints' => [
                                            new Assert\Uuid(),
                                            new Assert\Collection([
                                                'fields' => [
                                                    'uid' => new Assert\Required([new Assert\Uuid()]),
                                                    'delete' => new Assert\Optional([new Assert\Type('bool')]),
                                                ],
                                                'allowExtraFields' => false,
                                                'allowMissingFields' => false,
                                                'missingFieldsMessage' => 'Falta el campo requerido: {{ field }}',
                                                'extraFieldsMessage' => 'Campo no permitido: {{ field }}',
                                            ]),
                                        ],
                                        'message' => 'Formato inválido: cada elemento de professions debe ser un UID (string UUID) o un objeto con {uid} y opcionalmente {delete}.',
                                        'messageCollection' => 'Formato inválido: cada elemento de professions debe ser un UID (string UUID) o un objeto con {uid} y opcionalmente {delete}.',
                                        'includeInternalMessages' => true,
                                    ]),
                                ])
                            ),
                            'studies' => new Assert\Optional(new Assert\All([
                                new Assert\Collection(
                                    fields: [
                                        'uid' => new Assert\Optional(),
                                        'name' => new Assert\Optional(new Assert\NotBlank(message: 'Falta el campo requerido: name')),
                                        'institute' => new Assert\Optional(new Assert\NotBlank(message: 'Falta el campo requerido: institute')),


                                        'type' => new Assert\Optional(new Assert\Choice([
                                            'choices' => StudyType::values(),
                                            'message' => 'El valor seleccionado no es válido para studies.type. Permitidos: {{ choices }}',
                                        ])),

                                        'date_start' => new Assert\Optional(new Assert\Date()),
                                        'date_end' => new Assert\Optional(new Assert\Date()),
                                        'specialty_uid' => new Assert\Optional(new Assert\Uuid()),
                                        'delete' => new Assert\Optional(new Assert\Type('bool')),
                                        'url_certificate' => new Assert\Optional([new Assert\Url()]),
                                    ],
                                    allowExtraFields: false,
                                    allowMissingFields: true,
                                    missingFieldsMessage: 'Falta el campo requerido: {{ field }}',
                                    extraFieldsMessage: 'Campo no permitido: {{ field }}'
                                )
                            ])),
                        ],
                        allowExtraFields: false,
                        allowMissingFields: true,
                        missingFieldsMessage: 'Falta el campo requerido: {{ field }}',
                        extraFieldsMessage: 'Campo no permitido: {{ field }}'
                    ),
                    'files' => new Assert\Optional(),
                ],
                allowExtraFields: false,
                allowMissingFields: true,
                missingFieldsMessage: 'Falta el campo requerido: {{ field }}',
                extraFieldsMessage: 'Campo no permitido: {{ field }}'
            );

            $violations = $this->validator->validate($data, $constraints);
            if (count($violations) > 0) {
                foreach ($violations as $v) {
                    $fieldPath = $this->friendlyPath($v->getPropertyPath());
                    $msg = $v->getMessage();

                    $status = str_starts_with($msg, 'Campo no permitido:') ? 400 : 422;

                    if (
                        !str_starts_with($msg, 'Falta el campo requerido:') &&
                        !str_starts_with($msg, 'Campo no permitido:')
                    ) {
                        $msg = $fieldPath ? "Error en campo {$fieldPath}: {$msg}" : $msg;
                    }

                    throw new \RuntimeException($msg, $status);
                }
            }

            if (isset($data["fields"]['first_name'])) {
                $user->setFirstName($data["fields"]['first_name']);
            }
            if (isset($data["fields"]['last_name'])) {
                $user->setLastName($data["fields"]['last_name']);
            }
            if (isset($data["fields"]['password'])) {
                $user->setPassword(
                    $this->passwordHasher->hashPassword($user, $data["fields"]['password'])
                );
            }
            if (isset($data["fields"]['dni'])) {
                $user->setDni($data["fields"]['dni']);
            }
            if (isset($data["fields"]['phone_number'])) {
                $user->setPhoneNumber($data["fields"]['phone_number']);
            }
            if (isset($data["fields"]['phone'])) {
                $user->setPhoneNumber($data["fields"]['phone']);
            }
            if (isset($data["fields"]['msp_number'])) {
                $user->setMspNumber($data["fields"]['msp_number']);
            }

            $fields = $data['fields'] ?? [];
            $currentTypeRaw = $user->getTypeAccount();
            $currentType = $this->normalizeAccountType($currentTypeRaw);
            $incomingType = $this->normalizeAccountType($fields['type_account'] ?? null);

            if ($incomingType !== null) {
                $alreadySet = ($currentTypeRaw !== null && trim((string) $currentTypeRaw) !== '');
                if ($alreadySet && $incomingType !== $currentType) {
                    throw new \RuntimeException('El tipo de cuenta ya está establecido y no puede cambiarse.', 409);
                }

                if (!$alreadySet) {
                    $user->setTypeAccount($incomingType);

                    if ($incomingType === 'professional') {
                        $user->setStatus(UserStatusEnum::PENDING_COMPLETION->value);
                    }

                    $this->em->persist($user);
                    $currentType = $incomingType;
                }
            }


            $details = $user->getUserDetails() ?? new UserDetails();

            if (!empty($data["fields"]['details']) && is_array($data["fields"]['details'])) {
                $dData = $data["fields"]['details'];

                if (!$policiesAlreadyAccepted) {
                    if (($dData['policies'] ?? null) !== true) {
                        throw new \RuntimeException('Debe aceptar las políticas.', 422);
                    }
                    $details->setPolicies(true);
                } else {
                    if (array_key_exists('policies', $dData) && $dData['policies'] === true) {
                        $details->setPolicies(true);
                    }
                }

                if (!empty($dData['image']))
                    $details->setImage($dData['image']);
                if (!empty($dData['banner_image']))
                    $details->setBannerImage($dData['banner_image']);
                if (isset($dData['date_birth']))
                    $details->setDateBirth(new \DateTime($dData['date_birth']));
                if (isset($dData['gender']))
                    $details->setGender($dData['gender']);
                if (isset($dData['country']))
                    $details->setCountry($dData['country']);
                if (isset($dData['city']))
                    $details->setCity($dData['city']);
                if (isset($dData['zipcode']))
                    $details->setZipcode($dData['zipcode']);
                if (isset($dData['address']))
                    $details->setAddress($dData['address']);
                if (isset($dData['language']))
                    $details->setLanguage($dData['language']);
                if (isset($dData['about']))
                    $details->setAbout($dData['about']);
                if (isset($dData['professional_info']))
                    $details->setProfessionalInfo($dData['professional_info']);
                if (isset($dData['prefix_professional']))
                    $details->setPrefixProfessional($dData['prefix_professional']);
                if (isset($dData['consult_type']))
                    $details->setConsultType($dData['consult_type']);
                if (isset($dData['phone'])) {
                    $details->setPhone($dData['phone']);
                    $user->setPhoneNumber($dData['phone']);
                }
                if (isset($dData['dni']))
                    $user->setDni($dData['dni']);
                if (isset($dData['first_name']))
                    $user->setFirstName($dData['first_name']);
                if (isset($dData['last_name']))
                    $user->setLastName($dData['last_name']);
                if (isset($dData['time_availability']))
                    $details->setTimeAvailability($dData['time_availability']);
                if (isset($dData['medical_condition']))
                    $details->setMedicalCondition($dData['medical_condition']);
                if (isset($dData['consult_time']))
                    $details->setConsultTime((int) $dData['consult_time']);
                if (isset($dData['consult_price']))
                    $details->setConsultPrice((float) $dData['consult_price']);
                if (isset($dData['account_number']))
                    $details->setAccountNumber($dData['account_number']);
                if (isset($dData['holder_name']))
                    $details->setHolderName($dData['holder_name']);
                if (isset($dData['bank_name']))
                    $details->setBankName($dData['bank_name']);
                if (isset($dData['profile_media_type']))
                    $details->setProfileMediaType($dData['profile_media_type']);
                if (!empty($dData['profile_video_url'])) {
                    $details->setProfileVideoUrl($dData['profile_video_url']);
                }

                $details->setUser($user);

                if (method_exists($user, 'setUserDetails')) {
                    $user->setUserDetails($details);
                }
                $det = $user->getUserDetails();
                $bpUid = $dData['base_profession_uid'] ?? null;

                $hadTypeSet = ($user->getTypeAccount() !== null && trim((string) $user->getTypeAccount()) !== '');
                if (!$hadTypeSet && array_key_exists('base_profession_uid', $dData)) {
                    throw new \RuntimeException('Defina primero type_account ("professional" o "patient").', 400);
                }

                if ($currentType !== 'professional') {
                    $details->setBaseProfession(null);
                    $details->setPrefixProfessional(null);
                    $details->setProfessionalInfo(null);
                } else {
                    if (array_key_exists('base_profession_uid', $dData)) {
                        if ($bpUid === null || $bpUid === '') {
                            $details->setBaseProfession(null);
                        } else {
                            $prof = $this->profRepo->findOneBy(['uid' => $bpUid]);
                            if (!$prof) {
                                throw new \InvalidArgumentException('Profesión de base no encontrada.', 404);
                            }
                            $details->setBaseProfession($prof);
                            if (!$user->getProfessions()->contains($prof)) {
                                $user->addProfession($prof);
                            }

                            $dimension = $prof->getDimensions()->first();
                            if ($dimension instanceof Dimension) {
                                $details->setDimension($dimension);
                            }
                        }
                    }

                    $msUid = $dData['main_specialty_uid'] ?? null;
                    if (array_key_exists('main_specialty_uid', $dData)) {
                        if ($msUid === null || $msUid === '') {
                            $details->setMainSpecialty(null);
                        } else {
                            $spec = $this->specialtyRepo->findOneBy(['uid' => $msUid]);
                            if (!$spec) {
                                throw new \InvalidArgumentException('Especialidad principal no encontrada.', 404);
                            }
                            $details->setMainSpecialty($spec);
                            if ($spec->getRequiredBaseStudy()) {
                                $details->setBaseProfession($spec->getRequiredBaseStudy());
                                if (!$user->getProfessions()->contains($spec->getRequiredBaseStudy())) {
                                    $user->addProfession($spec->getRequiredBaseStudy());
                                }
                            }
                        }
                    }
                }

                if (array_key_exists('short_description', $dData)) {
                    $details->setShortDescription($dData['short_description']);
                }

                if (!empty($data["files"]["details"]['image']) && $data["files"]["details"]['image'] instanceof UploadedFile) {
                    $filename = $this->fileUploadUtil->upload($data["files"]["details"]['image'], 'profile_images');

                    $details->setImage($filename);
                    $details->setUser($user);
                }

                if (!empty($data["files"]["details"]['banner_image']) && $data["files"]["details"]['banner_image'] instanceof UploadedFile) {
                    $bannerName = $this->fileUploadUtil->upload($data["files"]["details"]['banner_image'], 'profile_banners');
                    $details->setBannerImage($bannerName);
                }

                $this->userDetailsRepository->save($details);
            }



            $det = $user->getUserDetails();
            $base = $det?->getBaseProfession();
            if ($base && !$user->getProfessions()->contains($base)) {
                $user->addProfession($base);
            }

            $studiesFieldItems = is_array($data["fields"]['studies'] ?? null) ? $data["fields"]['studies'] : [];
            $studiesFileItems = is_array($data["files"]['studies'] ?? null) ? $data["files"]['studies'] : [];

            $studiesIndices = array_values(array_unique(array_merge(array_keys($studiesFieldItems), array_keys($studiesFileItems))));

            if (!empty($studiesIndices)) {
                foreach ($studiesIndices as $idx) {
                    try {
                        $sData = $studiesFieldItems[$idx] ?? [];

                        $fileArr = $studiesFileItems[$idx] ?? [];
                        $fileObj = $fileArr['url_certificate'] ?? null;

                        $delete = isset($sData['delete']) ? filter_var($sData['delete'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null;
                        $uid = isset($sData['uid']) ? trim((string) $sData['uid']) : '';

                        if ($delete === true) {
                            if ($uid === '') {
                                throw new \RuntimeException("Para eliminar un estudio debes enviar su uid: fields.studies.$idx.uid", 422);
                            }
                            $study = $this->studyRepo->findOneBy(['uid' => $uid]);
                            if ($study && $study->getUser() === $user) {
                                $this->em->remove($study);
                            }
                            continue;
                        }

                        $hasUploadedFile = ($fileObj instanceof UploadedFile);

                        if ($uid !== '') {
                            $study = $this->studyRepo->findOneBy(['uid' => $uid]);
                            if (!$study || $study->getUser() !== $user) {
                                continue;
                            }
                            $study->setUpdatedAt(new \DateTimeImmutable());

                            if (array_key_exists('name', $sData))
                                $study->setName($sData['name']);
                            if (array_key_exists('institute', $sData))
                                $study->setInstitute($sData['institute']);
                            if (array_key_exists('type', $sData))
                                $study->setType($sData['type']);
                            if (isset($sData['date_start']))
                                $study->setDateStart(new \DateTime($sData['date_start']));
                            if (isset($sData['date_end']))
                                $study->setDateEnd(new \DateTime($sData['date_end']));

                            if ($hasUploadedFile) {
                                $urlCertificate = $this->fileUploadUtil->upload($fileObj, 'certificates');
                                $study->setUrlCertificate($urlCertificate);
                            }

                            if (isset($sData['specialty_uid'])) {
                                $spec = $this->specialtyRepo->findOneBy(['uid' => $sData['specialty_uid']]);
                                if ($spec) {
                                    $study->setSpecialty($spec);
                                }
                            }

                            $this->em->persist($study);
                            continue;
                        }

                        $required = ['name', 'institute', 'type'];
                        foreach ($required as $rk) {
                            if (!array_key_exists($rk, $sData) || $sData[$rk] === null || (is_string($sData[$rk]) && trim($sData[$rk]) === '')) {
                                throw new \RuntimeException("Falta el campo requerido: fields.studies.$idx.$rk", 422);
                            }
                        }

                        $study = new Studies();
                        $study->setUid(Uuid::uuid4()->toString());
                        $study->setCreatedAt(new \DateTimeImmutable());
                        $study->setUpdatedAt(new \DateTimeImmutable());
                        $study->setUser($user);

                        $study->setName($sData['name']);
                        $study->setInstitute($sData['institute']);
                        $study->setType($sData['type']);
                        if (isset($sData['date_start']))
                            $study->setDateStart(new \DateTime($sData['date_start']));
                        if (isset($sData['date_end']))
                            $study->setDateEnd(new \DateTime($sData['date_end']));

                        if ($hasUploadedFile) {
                            $urlCertificate = $this->fileUploadUtil->upload($fileObj, 'certificates');
                            $study->setUrlCertificate($urlCertificate);
                        }

                        if (isset($sData['specialty_uid'])) {
                            $spec = $this->specialtyRepo->findOneBy(['uid' => $sData['specialty_uid']]);
                            if ($spec) {
                                $study->setSpecialty($spec);
                            }
                        }

                        $this->em->persist($study);
                    } catch (\RuntimeException $e) {
                        throw $e;
                    } catch (\Exception $e) {
                        throw new \RuntimeException('Error interno del servidor al procesar los estudios.', 500);
                    }
                }
            }

            $this->em->flush();
            return ['user' => $user];
        } catch (\Throwable $e) {
            $this->logger->error('Profile update', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            if ($e instanceof \RuntimeException || $e instanceof \InvalidArgumentException) {
                throw $e;
            }

            throw new \RuntimeException('Error interno del servidor al guardar los datos del perfil.', 500);
        }
    }

    private function formatDate(?DateTimeInterface $dt): ?string
    {
        return $dt?->format(DateTimeInterface::ISO8601) ?: null;
    }

    private function getProfessionNameByGender(?Profession $profession, User $user): ?string
    {
        if (!$profession) return null;

        $gender = $user->getUserDetails()?->getGender();

        $specialty = $this->specialtyRepo->findOneBy([
            'required_base_study' => $profession,
            'is_base_profession' => true
        ]);

        if ($specialty) {
            if ($gender === 'female' && $specialty->getPublicTitleFemale()) {
                return $specialty->getPublicTitleFemale();
            }
            if ($gender === 'male' && $specialty->getPublicTitleMale()) {
                return $specialty->getPublicTitleMale();
            }
            if ($specialty->getPublicTitleNeutral()) {
                return $specialty->getPublicTitleNeutral();
            }
        }

        return $this->sanitizer->outText($profession->getName());
    }


    private function getSpecialtyNameByGender(?Specialty $specialty, User $user): ?string
    {
        if (!$specialty) return null;

        $gender = $user->getUserDetails()?->getGender();

        if ($gender === 'female' && $specialty->getPublicTitleFemale()) {
            return $this->sanitizer->outText($specialty->getPublicTitleFemale());
        }
        if ($gender === 'male' && $specialty->getPublicTitleMale()) {
            return $this->sanitizer->outText($specialty->getPublicTitleMale());
        }
        if ($specialty->getPublicTitleNeutral()) {
            return $this->sanitizer->outText($specialty->getPublicTitleNeutral());
        }

        return $this->sanitizer->outText($specialty->getName());
    }


    private function serializeAvailabilities(User $user): array
    {
        return array_map(
            fn($a) => [
                'day_of_week' => $a->getDayOfWeek()?->value,
                'start_time' => $a->getStartTime()?->format('H:i'),
                'end_time' => $a->getEndTime()?->format('H:i'),
            ],
            $user->getProfessionalAvailabilities()->toArray()
        );
    }

    private function error(int $code, string $message, array $details = []): array
    {
        $payload = ['code' => $code, 'message' => $message];
        if (!empty($details)) {
            $payload['details'] = $details;
        }
        return $payload;
    }

    private function normalizeAccountType(?string $type): ?string
    {
        if ($type === null)
            return null;
        $t = strtolower(trim($type));
        if ($t === '' || $t === 'null')
            return null;
        return in_array($t, ['patient', 'professional'], true) ? $t : $t;
    }

    /**
     * Devuelve uno o varios valores del objeto UserDetails.
     *
     * @param User      
     * @param string|string[] 
     * @return mixed|null|array
     */
    public function getUserDetail(User $user, string|array $keys): mixed
    {
        $details = $user->getUserDetails();
        if (!$details) {
            return is_array($keys) ? array_fill_keys($keys, null) : null;
        }

        $map = [
            'consultTime' => $details->getConsultTime(),
            'image' => $details->getImage(),
            'dateBirth' => $details->getDateBirth(),
            'gender' => $details->getGender(),
            'country' => $details->getCountry(),
            'city' => $details->getCity(),
            'language' => $details->getLanguage(),
            'consultType' => $details->getConsultType(),
        ];

        if (is_array($keys)) {
            return array_intersect_key($map, array_flip($keys));
        }

        return $map[$keys] ?? null;
    }

    private function friendlyPath(string $propertyPath): string
    {
        if ($propertyPath === '')
            return '';
        preg_match_all('/\[(.*?)\]/', $propertyPath, $m);
        $segments = array_filter($m[1] ?? [], fn($s) => $s !== 'data' && $s !== 'missing');
        return implode('.', $segments);
    }

    /**
     *
     * @throws \InvalidArgumentException si el usuario objetivo no es un consultante
     */
    public function getPatientProfileForProfessional(User $professional, User $patient): array
    {
        if ($patient->getTypeAccount() !== 'patient') {
            throw new \InvalidArgumentException('El perfil solicitado no corresponde a un consultante.');
        }

        $hasReservations = $this->bookingRepository->hasReservationWithPatient($professional, $patient);

        $data = $this->serializeProfile($patient);
        $data['uid'] = $patient->getUid();
        $data['hasReservations'] = $hasReservations;

        return $data;
    }
}
