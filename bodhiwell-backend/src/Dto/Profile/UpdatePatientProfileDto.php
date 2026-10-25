<?php

namespace App\Dto\Profile;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\ParameterBag;
use App\Enum\LatamCountryEnum;

class UpdatePatientProfileDto
{
    #[Assert\NotBlank(normalizer: 'trim')] #[Assert\Length(max: 80)]
    public ?string $first_name = null;

    #[Assert\NotBlank(normalizer: 'trim')] #[Assert\Length(max: 80)]
    public ?string $last_name = null;

    #[Assert\Length(max: 30)]
    public ?string $dni = null;

    #[Assert\Date(message: 'Formato de fecha inválido (YYYY-MM-DD).')]
    public ?string $date_birth = null;

    #[Assert\Length(max: 25)]
    public ?string $phone = null;

    #[Assert\Choice(['male', 'female', 'other'], message: 'Género inválido.')]
    public ?string $gender = null;

    #[Assert\Length(max: 20)]  public ?string $zipcode = null;
    #[Assert\Length(max: 255)] public ?string $address = null;
    #[Assert\Length(max: 120)] public ?string $city = null;
    public ?LatamCountryEnum $country = null;

    #[Assert\Length(max: 65535)]
    public ?string $medical_condition = null;

    #[Assert\Length(max: 65535)]
    public ?string $about = null;

    public static function fromRequest(Request $r): self
    {
        $in = self::input($r);
        $d = new self();
        $d->first_name        = self::str($in, 'first_name');
        $d->last_name         = self::str($in, 'last_name');
        $d->dni               = self::str($in, 'dni');
        $d->date_birth        = self::str($in, 'date_birth');
        $d->phone             = self::str($in, 'phone');
        $d->gender            = self::str($in, 'gender');
        $d->zipcode           = self::str($in, 'zipcode');
        $d->address           = self::str($in, 'address');
        $d->city              = self::str($in, 'city');
        $rawCountry           = self::str($in, 'country');
        $d->country           = $rawCountry ? LatamCountryEnum::tryFrom(strtoupper($rawCountry)) : null;
        $d->medical_condition = self::str($in, 'medical_condition');
        $d->about             = self::str($in, 'about');
        return $d;
    }

    private static function input(Request $r): ParameterBag
    {
        $ct = (string) $r->headers->get('content-type', '');
        if (str_starts_with($ct, 'application/json')) {
            return new ParameterBag($r->toArray());
        }
        return $r->request;
    }

    private static function str(ParameterBag $bag, string $key): ?string
    {
        $v = $bag->get($key);
        if (!is_string($v)) return null;
        $v = trim($v);
        return $v === '' ? null : $v;
    }
}
