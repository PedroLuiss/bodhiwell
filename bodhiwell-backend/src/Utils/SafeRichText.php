<?php

namespace App\Utils;

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

        $richElements = [
            'p',
            'span',
            'div',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'strong',
            'em',
            'u',
            's',
            'sub',
            'sup',
            'ul',
            'ol',
            'li',
            'blockquote',
            'code',
            'pre',
            'a',
            'br',
            'hr',
            'table',
            'thead',
            'tbody',
            'tfoot',
            'tr',
            'th',
            'td',
            'img',
        ];

        $config = (new HtmlSanitizerConfig())
            ->allowSafeElements()
            ->allowElement('a', ['href', 'title', 'target', 'rel'])
            ->allowLinkSchemes(['http', 'https', 'mailto'])
            ->allowRelativeLinks()
            ->allowMediaSchemes(['http', 'https'])
            ->allowRelativeMedias()
            ->allowElement('img', ['src', 'alt', 'title', 'width', 'height'])
            ->allowAttribute('srcset', ['img'])
            ->allowElement('span')
            ->allowElement('div')
            ->allowElement('u')
            ->allowElement('s')
            ->allowElement('sub')
            ->allowElement('sup')
            ->allowElement('abbr', ['title'])
            ->allowElement('table')
            ->allowElement('thead')
            ->allowElement('tbody')
            ->allowElement('tfoot')
            ->allowElement('tr')
            ->allowElement('th')
            ->allowElement('td')
            ->allowElement('br')
            ->allowElement('hr')
            ->allowAttribute('id',    $richElements)
            ->allowAttribute('title', ['a', 'abbr', 'img'])
            ->allowAttribute('style', $richElements);

        $this->sanitizer = new HtmlSanitizer($config);
    }

    public function toSafeHtml(?string $input): ?string
    {
        if ($input === null) return null;

        $containsHtml = preg_match('/<[^>]+>/', $input) === 1;
        $html = $containsHtml ? $input : $this->md->convert($input)->getContent();

        $sanitized = $this->sanitizer->sanitize($html);

        return $this->sanitizeInlineStyles($sanitized);
    }

    private function sanitizeInlineStyles(string $html): string
    {
        $callback = function (array $m): string {
            $style = $m[1];

            $dangerous = [
                '/url\s*\(/i',
                '/expression\s*\(/i',
                '/behavior\s*:/i',
                '/-moz-binding\s*:/i',
                '/javascript\s*:/i',
            ];
            $style = preg_replace($dangerous, '', $style);
            $style = preg_replace('/\s{2,}/', ' ', trim($style));

            return 'style="' . $style . '"';
        };

        return preg_replace_callback('/style="([^"]*)"/i', $callback, $html) ?? $html;
    }
}
