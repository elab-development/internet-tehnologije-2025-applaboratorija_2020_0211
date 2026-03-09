<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\EmailService;
use App\Services\RecaptchaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private RecaptchaService $recaptcha,
        private EmailService $email
    ) {}

    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Registracija novog korisnika",
     *     tags={"Autentifikacija"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","role"},
     *             @OA\Property(property="name", type="string", example="Petar Petrović"),
     *             @OA\Property(property="email", type="string", format="email", example="petar@test.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="role", type="string", enum={"user", "researcher"}, example="researcher"),
     *             @OA\Property(property="recaptcha_token", type="string", example="mock-token")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Uspešna registracija, vraća token"),
     *     @OA\Response(response=422, description="Validaciona greška")
     * )
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:user,researcher',
            'recaptcha_token' => 'nullable|string',
        ]);

        if ($request->recaptcha_token) {
            $valid = $this->recaptcha->verify($request->recaptcha_token, 'register');
            if (!$valid) {
                return response()->json(['message' => 'reCAPTCHA verifikacija nije uspela.'], 422);
            }
        }

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => $data['role'],
        ]);

        $this->email->sendWelcome($user);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => new UserResource($user)], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/login",
     *     summary="Prijava korisnika u sistem",
     *     tags={"Autentifikacija"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="admin@researchhub.app"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Uspešna prijava, vraća token"),
     *     @OA\Response(response=401, description="Pogrešni kredencijali")
     * )
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'recaptcha_token' => 'nullable|string',
        ]);

        if ($request->recaptcha_token) {
            $valid = $this->recaptcha->verify($request->recaptcha_token, 'login');
            if (!$valid) {
                return response()->json(['message' => 'reCAPTCHA verifikacija nije uspela.'], 422);
            }
        }

        if (!Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
            return response()->json(['message' => 'Pogrešan email ili lozinka.'], 401);
        }

        $user = Auth::user();
        if (!$user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'Nalog je deaktiviran.'], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => new UserResource($user)]);
    }

    /**
     * @OA\Post(
     *     path="/api/logout",
     *     summary="Odjava korisnika",
     *     tags={"Autentifikacija"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Uspešna odjava")
     * )
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Uspešno odjavljen.']);
    }

    /**
     * @OA\Get(
     *     path="/api/me",
     *     summary="Dohvatanje podataka o prijavljenom korisniku",
     *     tags={"Autentifikacija"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Podaci o korisniku"),
     *     @OA\Response(response=401, description="Niste prijavljeni")
     * )
     */
    public function me(Request $request)
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }
}
