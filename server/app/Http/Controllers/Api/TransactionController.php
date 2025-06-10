<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ReceiptEmail;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use GuzzleHttp\Client;

class TransactionController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index()
    {
        try {
            $transactions = Transaction::with(['items.product', 'user'])
                ->orderBy('created_at', 'desc')
                ->get();
        return response()->json($transactions);
        } catch (\Exception $e) {
            Log::error('Error fetching transactions:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch transactions'], 500);
        }
    }

    private function getBusinessSettings()
    {
        $settings = Setting::whereIn('key', [
            'store_name',
            'store_address',
            'store_phone',
            'store_email',
            'currency',
            'receipt_footer'
        ])->get()->keyBy('key');

        return [
            'name' => $settings->get('store_name')->value ?? 'POS System',
            'address' => $settings->get('store_address')->value ?? '123 Main Street',
            'phone' => $settings->get('store_phone')->value ?? '+1234567890',
            'email' => $settings->get('store_email')->value ?? 'store@example.com',
            'currency' => $settings->get('currency')->value ?? 'PHP',
            'receipt_footer' => $settings->get('receipt_footer')->value ?? 'Thank you for shopping with us!'
        ];
    }

    public function store(Request $request)
    {
        try {
            // Log the incoming request data
            Log::info('Transaction request data:', $request->all());

            // Check authentication
            if (!Auth::check()) {
                Log::error('Unauthenticated user tried to create transaction');
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'payment_method' => 'required|string|in:cash',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'discount_amount' => 'required|numeric|min:0',
            'tax_amount' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'payment_status' => 'required|string|in:completed,pending,voided'
        ]);

            Log::info('Validated transaction data:', $validated);

            DB::beginTransaction();

            try {
                // Create the transaction
            $transaction = Transaction::create([
                'user_id' => Auth::id(),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'payment_method' => $validated['payment_method'],
                    'payment_status' => $validated['payment_status'],
                    'subtotal' => $validated['subtotal'],
                    'discount_amount' => $validated['discount_amount'],
                    'tax_amount' => $validated['tax_amount'],
                    'total_amount' => $validated['total_amount'],
                'notes' => $validated['notes']
            ]);

                Log::info('Transaction created:', $transaction->toArray());

                // Create transaction items and update stock
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                    // Check stock availability
                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                    // Create transaction item
                    $total_amount = ($item['unit_price'] * $item['quantity']) - ($item['discount_amount'] ?? 0);
                    $transaction_item = TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'discount_amount' => $item['discount_amount'] ?? 0,
                        'total_amount' => $total_amount
                    ]);

                    Log::info('Transaction item created:', [
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'discount_amount' => $item['discount_amount'] ?? 0,
                        'total_amount' => $total_amount
                ]);

                    // Update product stock
                    $product->stock_quantity -= $item['quantity'];
                    $product->save();

                    Log::info('Product stock updated:', [
                        'product_id' => $product->id,
                        'new_stock' => $product->stock_quantity
                    ]);
                }

                // Refresh the transaction to get the latest items
                $transaction->refresh();
                $transaction->load('items.product');

                // Debug log raw items data
                Log::info('Raw items data before processing:', [
                    'items_count' => $transaction->items->count(),
                    'items' => $transaction->items->toArray()
                ]);

                // Send receipt if email provided
                if ($transaction->customer_email) {
                    try {
                        // Get business settings
                        $businessSettings = $this->getBusinessSettings();

                        // Format items array with improved structure
                        $items = $transaction->items->map(function($item) {
                            // Calculate item total based on quantity and unit price
                            $itemTotal = (float)$item->quantity * (float)$item->unit_price;
                            $discountAmount = (float)($item->discount_amount ?? 0);

                            // Calculate discount percentage
                            $discountPercentage = $itemTotal > 0 ? round(($discountAmount / $itemTotal) * 100) : 0;

                            $formattedItem = [
                                'product' => [
                                    'name' => (string)$item->product->name,
                                    'id' => (int)$item->product->id,
                                    'price' => number_format((float)$item->unit_price, 2, '.', '')
                                ],
                                'quantity' => (int)$item->quantity,
                                'unit_price' => number_format((float)$item->unit_price, 2, '.', ''),
                                'total_amount' => number_format($itemTotal, 2, '.', ''),
                                'discount' => [
                                    'amount' => number_format($discountAmount, 2, '.', ''),
                                    'percentage' => $discountPercentage
                                ]
                            ];

                            // Log each formatted item
                            Log::info('Formatted item:', $formattedItem);

                            return $formattedItem;
                        })->values()->toArray();

                        // Log the final items array
                        Log::info('Final items array:', [
                            'items_count' => count($items),
                            'items' => $items
                        ]);

                        // Calculate total discount percentage
                        $subtotal = (float)$transaction->subtotal;
                        $discountAmount = (float)($transaction->discount_amount ?? 0);
                        $discountPercentage = $subtotal > 0 ? round(($discountAmount / $subtotal) * 100) : 0;

                        // Prepare the payload with improved structure
                        $payload = [
                            'transaction' => [
                                'id' => (int)$transaction->id,
                                'reference_number' => (string)$transaction->reference_number,
                                'date' => $transaction->created_at->setTimezone('Asia/Manila')->format('M d, Y g:i A'),
                                'payment' => [
                                    'method' => ucfirst($transaction->payment_method),
                                    'status' => strtoupper($transaction->payment_status),
                                    'notes' => $transaction->notes
                                ]
                            ],
                            'customer' => [
                                'name' => (string)($transaction->customer_name ?? 'Guest'),
                                'email' => (string)$transaction->customer_email
                            ],
                            'items' => $items,
                            'totals' => [
                                'subtotal' => number_format($subtotal, 2, '.', ''),
                                'discount' => [
                                    'amount' => number_format($discountAmount, 2, '.', ''),
                                    'percentage' => $discountPercentage
                                ],
                                'tax' => number_format((float)$transaction->tax_amount, 2, '.', ''),
                                'total' => number_format((float)$transaction->total_amount, 2, '.', '')
                            ],
                            'business' => [
                                'name' => (string)$businessSettings['name'],
                                'address' => (string)$businessSettings['address'],
                                'phone' => (string)$businessSettings['phone'],
                                'email' => (string)$businessSettings['email'],
                                'currency' => (string)$businessSettings['currency'],
                                'receipt_footer' => (string)$businessSettings['receipt_footer']
                            ],
                            'email_settings' => [
                                'to' => (string)$transaction->customer_email,
                                'subject' => 'Your Purchase Receipt - ' . $transaction->reference_number,
                                'from_name' => $businessSettings['name']
                            ]
                        ];

                        // Log the final payload
                        Log::info('Final Make.com payload:', [
                            'payload' => json_encode($payload, JSON_PRETTY_PRINT)
                        ]);

                        $makeWebhookUrl = config('services.make.webhook_url');
                        if ($makeWebhookUrl) {
                            $client = new Client();
                            $response = $client->post($makeWebhookUrl, [
                                'json' => $payload,
                                'headers' => [
                                    'Content-Type' => 'application/json',
                                    'Accept' => 'application/json'
                                ]
                            ]);

                            // Log the Make.com response
                            Log::info('Make.com response:', [
                                'status_code' => $response->getStatusCode(),
                                'body' => $response->getBody()->getContents()
                            ]);

                            // Mark receipt as sent immediately since we can't receive callback
                            $transaction->receipt_sent = true;
                            $transaction->notes = ($transaction->notes ? $transaction->notes . "\n" : '') . "Email queued via Make.com";
                            $transaction->save();
                        } else {
                            Log::warning('Make.com webhook URL not configured');
                        }
                    } catch (\Exception $e) {
                        Log::error('Failed to trigger Make.com webhook:', [
                            'transaction_id' => $transaction->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                }

            DB::commit();
            return response()->json($transaction->load('items.product'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
                Log::error('Error during transaction creation:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }

        } catch (ValidationException $e) {
            Log::warning('Transaction validation failed:', [
                'errors' => $e->errors()
            ]);
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Unexpected error during transaction:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function show(Transaction $transaction)
    {
        try {
            return response()->json($transaction->load('items.product'));
        } catch (\Exception $e) {
            Log::error('Error fetching transaction:', [
                'id' => $transaction->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to fetch transaction'], 500);
        }
    }

    public function generateReceipt(Transaction $transaction)
    {
        try {
            $transaction->load('items.product', 'user');
            $businessSettings = $this->getBusinessSettings();

            $receiptData = [
                'business' => $businessSettings,
                'transaction' => [
                    'id' => $transaction->id,
                    'reference_number' => $transaction->reference_number,
                    'date' => $transaction->created_at,
                    'customer_name' => $transaction->customer_name ?? 'Walk-in Customer',
                    'cashier' => $transaction->user->name,
                    'items' => $transaction->items->map(function ($item) {
                        return [
                            'name' => $item->product->name,
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                            'total' => $item->total_amount,
                        ];
                    }),
                    'subtotal' => $transaction->subtotal,
                    'discount' => $transaction->discount_amount,
                    'tax' => $transaction->tax_amount,
                    'total' => $transaction->total_amount,
                    'payment_method' => $transaction->payment_method,
                    'payment_status' => $transaction->payment_status,
                ]
            ];

            return response()->json($receiptData);
        } catch (\Exception $e) {
            Log::error('Error generating receipt:', [
                'id' => $transaction->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to generate receipt'], 500);
        }
    }

    public function addFeedback(Request $request, Transaction $transaction)
    {
        try {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'feedback' => 'nullable|string'
        ]);

        $transaction->satisfaction_rating = $validated['rating'];
        $transaction->feedback = $validated['feedback'];
        $transaction->save();

        return response()->json($transaction);
        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error adding feedback:', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to add feedback'], 500);
        }
    }

    public function void(Request $request, $id)
    {
        try {
            $transaction = Transaction::findOrFail($id);
            $transaction->payment_status = 'voided';
            $transaction->save();

            return response()->json([
                'message' => 'Transaction voided successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error voiding transaction:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error voiding transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function submitFeedback(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'satisfaction_rating' => 'required|integer|min:1|max:5',
                'feedback' => 'nullable|string|max:1000'
            ]);

            $transaction = Transaction::findOrFail($id);
            $transaction->satisfaction_rating = $validated['satisfaction_rating'];
            $transaction->feedback = $validated['feedback'];
            $transaction->save();

            return response()->json([
                'message' => 'Feedback submitted successfully',
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            Log::error('Error submitting feedback:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error submitting feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getStoreSettings()
    {
        // Implementation of getStoreSettings method
    }
}
