<?php

namespace App\Services\Security;

use League\CommonMark\CommonMarkConverter;
use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

class SafeRichText
{
    private CommonMarkConverter $md;
    private HtmlSanitizer $sanitizer;

    public function __construct()
    {
        $this->md = new CommonMarkConverter([
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);

        $config = (new HtmlSanitizerConfig())
            ->allowSafeElements()
            ->allowElement('a', ['href'])
            ->allowLinkSchemes(['http', 'https', 'mailto'])
            ->allowRelativeLinks();

        $this->sanitizer = new HtmlSanitizer($config);
    }

    public function toSafeHtml(?string $input): ?string
    {
        if ($input === null) {
            return null;
        }

        $containsHtml = preg_match('/<[^>]+>/', $input) === 1;
        $html = $containsHtml ? $input : $this->md->convert($input)->getContent();

        return $this->sanitizer->sanitize($html);
    }
}
