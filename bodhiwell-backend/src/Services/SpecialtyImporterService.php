<?php

namespace App\Services;

use App\Entity\Dimension;
use App\Entity\Profession;
use App\Entity\Specialty;
use App\Enum\ClinicalLevelEnum;
use App\Enum\LegalFrameworkEnum;
use App\Repository\DimensionRepository;
use App\Repository\ProfessionRepository;
use App\Repository\SpecialtyRepository;
use Doctrine\ORM\EntityManagerInterface;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Ramsey\Uuid\Uuid;

class SpecialtyImporterService
{
    private const DIMENSION_METADATA = [
        'cuerpo' => ['color' => '#E67E22', 'icon' => 'fa-apple-whole'],
        'mente' => ['color' => '#3498DB', 'icon' => 'fa-brain'],
        'energia' => ['color' => '#9B59B6', 'icon' => 'fa-bolt'],
        'conciencia' => ['color' => '#2ECC71', 'icon' => 'fa-eye'],
    ];

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly DimensionRepository $dimensionRepository,
        private readonly ProfessionRepository $professionRepository,
        private readonly SpecialtyRepository $specialtyRepository
    ) {}

    public function importFromData(array $data): array
    {
        $createdCount = 0;
        $updatedCount = 0;
        $professionsCache = [];
        $dimensionsCache = [];

        foreach ($data as $row) {
            $dimension = $this->getOrCreateDimension($row['dimension_slug'], $dimensionsCache);
            $baseProfession = $this->getOrCreateProfession($row['required_base_study'] ?? null, $professionsCache);

            $specialty = $this->specialtyRepository->findOneBy(['slug' => $row['slug']]);

            if (!$specialty) {
                $specialty = new Specialty();
                $specialty->setSlug($row['slug']);
                $createdCount++;
            } else {
                $updatedCount++;
            }

            $specialty->setName($row['name']);
            $specialty->setDimension($dimension);
            $specialty->setLegalFramework($row['legal_framework']);
            $specialty->setClinicalLevel($row['clinical_level']);
            $specialty->setRequiredBaseStudy($baseProfession);
            $specialty->setMspRequired($row['msp_required'] ?? false);
            $specialty->setIsBaseProfession($row['is_base_profession'] ?? true);
            $specialty->setPublicTitleMale($row['public_title_male'] ?? '');
            $specialty->setPublicTitleFemale($row['public_title_female'] ?? '');
            $specialty->setPublicTitleNeutral($row['public_title_neutral'] ?? '');
            $specialty->setDescription($row['description'] ?? '');

            $this->entityManager->persist($specialty);
        }

        $this->entityManager->flush();

        return [
            'created' => $createdCount,
            'updated' => $updatedCount,
            'total' => count($data),
        ];
    }

    public function importFromFile(string $filePath): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        $header = array_shift($rows);
        $data = [];

        foreach ($rows as $row) {
            if (empty($row[1])) continue;

            $data[] = [
                'name' => $row[1],
                'slug' => !empty($row[12]) ? $row[12] : $this->slugify($row[1]),
                'dimension_slug' => strtolower($row[2] ?? 'cuerpo'),
                'legal_framework' => $this->mapLegalFramework($row[3] ?? ''),
                'clinical_level' => $this->mapClinicalLevel($row[4] ?? ''),
                'required_base_study' => $row[5] ?? null,
                'msp_required' => strtolower($row[6] ?? '') === 'si' || strtolower($row[6] ?? '') === 'yes' || $row[6] === '1' || $row[6] === true,
                'is_base_profession' => !(strtolower($row[7] ?? '') === 'no' || $row[7] === '0' || $row[7] === false),
                'public_title_male' => $row[8] ?? null,
                'public_title_female' => $row[9] ?? null,
                'public_title_neutral' => $row[10] ?? null,
                'description' => $row[11] ?? null,
            ];
        }

        return $this->importFromData($data);
    }

    private function getOrCreateDimension(string $name, array &$cache): Dimension
    {
        $slug = $this->slugify($name);
        if (isset($cache[$slug])) return $cache[$slug];

        $dimension = $this->dimensionRepository->findOneBy(['slug' => $slug]);

        if (!$dimension) {
            $dimension = new Dimension();
            $dimension->setName(ucfirst($slug));
            $dimension->setSlug($slug);
            $dimension->setUid(Uuid::uuid4()->toString());
            $this->entityManager->persist($dimension);
        }

        if (isset(self::DIMENSION_METADATA[$slug])) {
            $meta = self::DIMENSION_METADATA[$slug];
            if (!$dimension->getColorCode()) {
                $dimension->setColorCode($meta['color']);
            }
            if (!$dimension->getIcon()) {
                $dimension->setIcon($meta['icon']);
            }
        }

        $cache[$slug] = $dimension;
        return $dimension;
    }

    private function getOrCreateProfession(?string $name, array &$cache): ?Profession
    {
        if (empty($name)) return null;

        $normalizedName = ucfirst(strtolower(trim($name)));
        $cacheKey = $this->slugify($name);

        if (isset($cache[$cacheKey])) return $cache[$cacheKey];

        $profession = $this->professionRepository->findOneBy(['name' => $normalizedName]);

        if (!$profession) {
            $profession = new Profession();
            $profession->setName($normalizedName);
            $profession->setStatus('active');
            $profession->setUid(Uuid::uuid4()->toString());
            $this->entityManager->persist($profession);
        }

        $cache[$cacheKey] = $profession;
        return $profession;
    }

    private function mapLegalFramework(string $value): ?LegalFrameworkEnum
    {
        $value = trim($value);
        if (empty($value)) return LegalFrameworkEnum::UNREGULATED_PRACTICE;

        foreach (LegalFrameworkEnum::cases() as $case) {
            if (
                strcasecmp($case->name, $value) === 0 ||
                strcasecmp($case->value, $value) === 0 ||
                strcasecmp($case->label(), $value) === 0
            ) {
                return $case;
            }
        }

        return LegalFrameworkEnum::UNREGULATED_PRACTICE;
    }

    private function mapClinicalLevel(string $value): ?ClinicalLevelEnum
    {
        $value = trim($value);
        if (empty($value)) return ClinicalLevelEnum::SUPPORT;

        foreach (ClinicalLevelEnum::cases() as $case) {
            if (
                strcasecmp($case->name, $value) === 0 ||
                strcasecmp($case->value, $value) === 0 ||
                strcasecmp($case->label(), $value) === 0
            ) {
                return $case;
            }
        }

        return ClinicalLevelEnum::SUPPORT;
    }

    private function slugify(string $text): string
    {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT//IGNORE', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);
        return empty($text) ? 'n-a' : $text;
    }
}
