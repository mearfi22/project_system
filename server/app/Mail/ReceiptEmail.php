<?php

namespace App\Mail;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ReceiptEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $transaction;

    public function __construct(Transaction $transaction)
    {
        $this->transaction = $transaction;
    }

    public function build()
    {
        return $this->subject('Your Purchase Receipt from ' . config('app.name'))
            ->markdown('emails.receipt', [
                'transaction' => $this->transaction,
                'items' => $this->transaction->items->load('product'),
                'farewell' => $this->getFarewellMessage()
            ]);
    }

    private function getFarewellMessage()
    {
        $messages = [
            'Thank you for your purchase!',
            'We appreciate your business!',
            'Have a great day!',
            'Thank you for shopping with us!',
            'We hope to see you again soon!'
        ];

        return $messages[array_rand($messages)];
    }
}
