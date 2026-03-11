<?php

return [
    'paths'                    => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods'          => ['*'],
    'allowed_origins'          => array_map(fn($o) => rtrim(trim($o), '/'), array_filter(explode(',', env('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000')))),
    'allowed_origins_patterns' => [],
    'allowed_headers'          => ['*'],
    'exposed_headers'          => [],
    'max_age'                  => 0,
    'supports_credentials'     => true,
];
