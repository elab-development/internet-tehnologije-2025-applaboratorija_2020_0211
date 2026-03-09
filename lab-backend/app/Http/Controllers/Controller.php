<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="ResearchHub API Dokumentacija",
 *      description="Ovo je REST API specifikacija za sistem laboratorije ResearchHub. Kroz ovaj interfejs možete testirati sve dostupne rute.",
 *      @OA\Contact(
 *          email="admin@researchhub.app",
 *          name="ResearchHub Tim"
 *      )
 * )
 *
 * @OA\Server(
 *      url=L5_SWAGGER_CONST_HOST,
 *      description="Lokalni Development Server"
 * )
 *
 * @OA\SecurityScheme(
 *      securityScheme="bearerAuth",
 *      type="http",
 *      scheme="bearer",
 *      bearerFormat="JWT",
 *      description="Unesite Sanctum token dobijen nakon logina."
 * )
 */
class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;
}
