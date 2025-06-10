<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function transactionCreated(Request $request)
    {
        try {
            Log::info('Webhook received from Make.com', $request->all());

            // Validate the webhook payload
            $validatedData = $request->validate([
                'transaction_id' => 'required|exists:transactions,id',
                'email_sent' => 'required|boolean',
                'email_status' => 'required|string',
                'make_execution_id' => 'required|string'
            ]);

            // Update the transaction with the email status
            $transaction = Transaction::findOrFail($validatedData['transaction_id']);
            $transaction->receipt_sent = $validatedData['email_sent'];
            $transaction->notes = $transaction->notes . "\nEmail Status: " . $validatedData['email_status'];
            $transaction->save();

            return response()->json([
                'message' => 'Webhook processed successfully',
                'transaction_id' => $transaction->id
            ]);
        } catch (\Exception $e) {
            Log::error('Error processing webhook:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to process webhook',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
