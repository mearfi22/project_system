<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use ReCaptcha\ReCaptcha;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'recaptcha_token' => 'required|string',
        ]);

        // Verify reCAPTCHA
        $recaptcha = new ReCaptcha(config('services.recaptcha.secret_key'));
        $response = $recaptcha->verify($request->recaptcha_token);

        if (!$response->isSuccess()) {
            throw ValidationException::withMessages([
                'recaptcha' => ['CAPTCHA verification failed. Please try again.'],
            ]);
        }

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => $this->getUserData($user),
                'message' => 'Login successful'
            ]);
        }

        throw ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json($this->getUserData($user));
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    private function getUserData($user)
    {
        // Load the role with its permissions
        $user->load('role.permissions');

        return [
            'id' => $user->user_id,
            'first_name' => $user->first_name,
            'middle_name' => $user->middle_name,
            'last_name' => $user->last_name,
            'suffix_name' => $user->suffix_name,
            'email' => $user->email,
            'role' => [
                'name' => $user->role->name,
                'permissions' => $user->role->permissions->pluck('name')->toArray()
            ]
        ];
    }
}
