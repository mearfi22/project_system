<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        try {
            $this->authorize('manage_settings');

            $settings = Setting::all()->groupBy('group');

            return response()->json([
                'settings' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching settings:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error fetching settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $this->authorize('manage_settings');

            $validated = $request->validate([
                'key' => 'required|string|unique:settings',
                'value' => 'required',
                'type' => 'required|in:string,number,boolean,json',
                'group' => 'required|string',
                'label' => 'required|string',
                'description' => 'nullable|string',
                'is_public' => 'boolean'
            ]);

            $setting = Setting::create($validated);
            Cache::forget('settings.' . $setting->key);

            return response()->json([
                'message' => 'Setting created successfully',
                'setting' => $setting
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating setting:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error creating setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Setting $setting)
    {
        try {
            $this->authorize('manage_settings');

            $validated = $request->validate([
                'value' => 'required',
                'label' => 'sometimes|string',
                'description' => 'nullable|string',
                'is_public' => 'sometimes|boolean'
            ]);

            $setting->update($validated);
            Cache::forget('settings.' . $setting->key);

            return response()->json([
                'message' => 'Setting updated successfully',
                'setting' => $setting
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating setting:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error updating setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function bulkUpdate(Request $request)
    {
        try {
            $this->authorize('manage_settings');

            $validated = $request->validate([
                'settings' => 'required|array',
                'settings.*.key' => 'required|string|exists:settings,key',
                'settings.*.value' => 'required'
            ]);

            foreach ($validated['settings'] as $settingData) {
                $setting = Setting::where('key', $settingData['key'])->first();
                if ($setting) {
                    $setting->value = $settingData['value'];
                    $setting->save();
                    Cache::forget('settings.' . $setting->key);
                }
            }

            return response()->json([
                'message' => 'Settings updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating settings:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error updating settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getPublicSettings()
    {
        try {
            $settings = Setting::where('is_public', true)->get()
                ->mapWithKeys(function ($setting) {
                    return [$setting->key => $setting->value];
                });

            return response()->json([
                'settings' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching public settings:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error fetching public settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
