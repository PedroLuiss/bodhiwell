<?php

require __DIR__ . '/vendor/autoload.php';

use EasyCorp\Bundle\EasyAdminBundle\Filter\TextFilter;

$filter = TextFilter::new('test');
var_dump($filter);

if (is_array($filter)) {
    echo "It is an array!\n";
} else {
    echo "It is an object!\n";
}
