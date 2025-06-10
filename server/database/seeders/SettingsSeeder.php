<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    public function run()
    {
        $settings = [
            // Store Settings
            [
                'key' => 'store_name',
                'value' => 'POS System',
                'type' => 'string',
                'group' => 'store',
                'label' => 'Store Name',
                'description' => 'The name of your store that appears in the navbar and throughout the application',
                'is_public' => true
            ],
            [
                'key' => 'store_address',
                'value' => '123 Main Street',
                'type' => 'string',
                'group' => 'store',
                'label' => 'Store Address',
                'description' => 'The physical address of your store',
                'is_public' => true
            ],
            [
                'key' => 'store_phone',
                'value' => '+1234567890',
                'type' => 'string',
                'group' => 'store',
                'label' => 'Store Phone',
                'description' => 'Contact number for your store',
                'is_public' => true
            ],
            [
                'key' => 'store_email',
                'value' => 'store@example.com',
                'type' => 'string',
                'group' => 'store',
                'label' => 'Store Email',
                'description' => 'Email address for your store',
                'is_public' => true
            ],
            [
                'key' => 'tax_rate',
                'value' => '10',
                'type' => 'number',
                'group' => 'store',
                'label' => 'Tax Rate (%)',
                'description' => 'Default tax rate for sales',
                'is_public' => true
            ],
            [
                'key' => 'currency',
                'value' => 'PHP',
                'type' => 'string',
                'group' => 'store',
                'label' => 'Currency',
                'description' => 'Store currency code',
                'is_public' => true
            ],
            [
                'key' => 'receipt_footer',
                'value' => 'Thank you for shopping with us!',
                'type' => 'string',
                'group' => 'store',
                'label' => 'Receipt Footer',
                'description' => 'Message to display at the bottom of receipts',
                'is_public' => true
            ],

            // System Settings
            [
                'key' => 'low_stock_threshold',
                'value' => '10',
                'type' => 'number',
                'group' => 'system',
                'label' => 'Low Stock Threshold',
                'description' => 'Default threshold for low stock alerts',
                'is_public' => false
            ],
            [
                'key' => 'enable_email_receipts',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'system',
                'label' => 'Enable Email Receipts',
                'description' => 'Send receipts via email when available',
                'is_public' => false
            ],
            [
                'key' => 'enable_stock_alerts',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'system',
                'label' => 'Enable Stock Alerts',
                'description' => 'Send notifications for low stock',
                'is_public' => false
            ],

            // Backup Settings
            [
                'key' => 'auto_backup_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'backup',
                'label' => 'Enable Auto Backup',
                'description' => 'Automatically backup system data',
                'is_public' => false
            ],
            [
                'key' => 'backup_frequency',
                'value' => 'daily',
                'type' => 'string',
                'group' => 'backup',
                'label' => 'Backup Frequency',
                'description' => 'How often to create backups',
                'is_public' => false
            ],
            [
                'key' => 'backup_retention_days',
                'value' => '30',
                'type' => 'number',
                'group' => 'backup',
                'label' => 'Backup Retention (Days)',
                'description' => 'Number of days to keep backups',
                'is_public' => false
            ]
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
