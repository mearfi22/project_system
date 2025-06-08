@component('mail::message')
# Dear {{ $transaction->customer_name }},

Thank you for your purchase! Here's your receipt for transaction #{{ $transaction->id }}.

@component('mail::table')
| Product | Quantity | Price | Total |
|:--------|:---------|:------|:------|
@foreach($items as $item)
| {{ $item->product->name }} | {{ $item->quantity }} | ${{ number_format($item->unit_price, 2) }} | ${{ number_format($item->total_amount, 2) }} |
@endforeach
@endcomponent

## Order Summary
Subtotal: ${{ number_format($transaction->subtotal, 2) }}
@if($transaction->discount_amount > 0)
Discount: -${{ number_format($transaction->discount_amount, 2) }}
@endif
@if($transaction->tax_amount > 0)
Tax: ${{ number_format($transaction->tax_amount, 2) }}
@endif
**Total: ${{ number_format($transaction->total_amount, 2) }}**

Payment Method: {{ $transaction->payment_method }}
Transaction Date: {{ $transaction->created_at->format('F j, Y g:i A') }}

@component('mail::button', ['url' => route('feedback.survey', ['transaction' => $transaction->id])])
Rate Your Experience
@endcomponent

{{ $farewell }}

Best regards,<br>
{{ config('app.name') }} Team
@endcomponent
