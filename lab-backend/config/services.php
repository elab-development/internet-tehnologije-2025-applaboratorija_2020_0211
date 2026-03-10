<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'secret' => env('MAILGUN_SECRET'),
        'domain' => env('MAILGUN_DOMAIN'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key'    => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key'        => env('RESEND_API_KEY'),
        'from_email' => env('RESEND_FROM_EMAIL', 'noreply@researchhub.local'),
    ],

    'recaptcha' => [
        'site_key'  => env('RECAPTCHA_SITE_KEY'),
        'secret'    => env('RECAPTCHA_SECRET_KEY'),
        'enabled'   => env('RECAPTCHA_ENABLED', true),
    ],

];
