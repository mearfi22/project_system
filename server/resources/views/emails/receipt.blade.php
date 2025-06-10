@component('mail::message')
<style>
    /* Modern Color Scheme */
    :root {
        --primary-color: #2563eb;
        --success-color: #16a34a;
        --text-color: #1f2937;
        --text-muted: #6b7280;
        --border-color: #e5e7eb;
        --bg-light: #f9fafb;
    }

    /* Base Styles */
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.5;
        color: var(--text-color);
    }

    /* Header Styles */
    .receipt-header {
        text-align: center;
        padding: 2rem 0;
        border-bottom: 2px solid var(--border-color);
        margin-bottom: 2rem;
    }

    .receipt-header h1 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        color: var(--primary-color);
    }

    .receipt-header p {
        color: var(--text-muted);
        margin: 0.5rem 0 0;
    }

    /* Transaction Info */
    .transaction-info {
        background: var(--bg-light);
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 2rem;
        font-size: 0.875rem;
    }

    .transaction-info strong {
        color: var(--text-color);
        min-width: 120px;
        display: inline-block;
    }

    /* Items Table */
    .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 2rem;
    }

    .items-table th {
        background: var(--bg-light);
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
        color: var(--text-color);
        border-bottom: 2px solid var(--border-color);
    }

    .items-table td {
        padding: 1rem 0.75rem;
        border-bottom: 1px solid var(--border-color);
    }

    .item-name {
        color: var(--text-color);
        font-weight: 500;
    }

    .item-discount {
        display: block;
        font-size: 0.75rem;
        color: var(--success-color);
        margin-top: 0.25rem;
    }

    /* Totals Section */
    .totals-section {
        background: var(--bg-light);
        border-radius: 0.5rem;
        padding: 1rem;
        margin-top: 2rem;
    }

    .total-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        font-size: 0.875rem;
    }

    .total-row.border-top {
        border-top: 1px solid var(--border-color);
        margin-top: 0.5rem;
        padding-top: 1rem;
    }

    .discount-text {
        color: var(--success-color);
    }

    .grand-total {
        font-size: 1.125rem;
        font-weight: 600;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 2px solid var(--border-color);
    }

    /* Business Info */
    .business-info {
        text-align: center;
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
        color: var(--text-muted);
        font-size: 0.875rem;
    }

    .business-info p {
        margin: 0.25rem 0;
    }

    /* Footer */
    .receipt-footer {
        text-align: center;
        margin-top: 2rem;
        padding: 1rem;
        background: var(--bg-light);
        border-radius: 0.5rem;
        font-style: italic;
        color: var(--text-muted);
    }

    /* Payment Method Badge */
    .payment-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        background: var(--primary-color);
        color: white;
        border-radius: 1rem;
        font-size: 0.75rem;
        margin-left: 0.5rem;
    }
</style>

<div class="receipt-header">
    <h1>{{ $business['name'] }}</h1>
    <p>Purchase Receipt</p>
</div>

<div class="transaction-info">
    <div><strong>Reference:</strong> {{ $transaction->reference_number }}</div>
    <div><strong>Transaction #:</strong> {{ $transaction->id }}</div>
    <div><strong>Date:</strong> {{ $transaction->created_at->format('M d, Y g:i A') }}</div>
    <div><strong>Customer:</strong> {{ $transaction->customer_name }}</div>
    <div><strong>Payment:</strong> {{ ucfirst($transaction->payment_method) }} <span class="payment-badge">{{ strtoupper($transaction->payment_status) }}</span></div>
</div>

<table class="items-table">
    <thead>
        <tr>
            <th>Item</th>
            <th style="text-align: center">Qty</th>
            <th style="text-align: right">Price</th>
            <th style="text-align: right">Total</th>
        </tr>
    </thead>
    <tbody>
        @foreach($items as $item)
        <tr>
            <td>
                <span class="item-name">{{ $item->product->name }}</span>
                @if($item->discount_amount > 0)
                @php
                    $itemTotal = $item->quantity * $item->unit_price;
                    $itemDiscountPercentage = $itemTotal > 0 ? ($item->discount_amount / $itemTotal) * 100 : 0;
                @endphp
                <span class="item-discount">
                    Discount: {{ number_format($itemDiscountPercentage, 0) }}% (-PHP {{ number_format($item->discount_amount, 2) }})
                </span>
                @endif
            </td>
            <td style="text-align: center">{{ $item->quantity }}</td>
            <td style="text-align: right">PHP {{ number_format($item->unit_price, 2) }}</td>
            <td style="text-align: right">PHP {{ number_format($item->total_amount, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<div class="totals-section">
    <div class="total-row">
        <span>Subtotal:</span>
        <span>PHP {{ number_format($transaction->subtotal, 2) }}</span>
    </div>

    @if($transaction->discount_amount > 0)
    @php
        $discountPercentage = $transaction->subtotal > 0 ? ($transaction->discount_amount / $transaction->subtotal) * 100 : 0;
    @endphp
    <div class="total-row">
        <span class="discount-text">Discount ({{ number_format($discountPercentage, 0) }}%):</span>
        <span class="discount-text">-PHP {{ number_format($transaction->discount_amount, 2) }}</span>
    </div>
    @endif

    <div class="total-row">
        <span>Tax:</span>
        <span>PHP {{ number_format($transaction->tax_amount, 2) }}</span>
    </div>

    <div class="total-row grand-total">
        <span>Total Amount:</span>
        <span>PHP {{ number_format($transaction->total_amount, 2) }}</span>
    </div>
</div>

<div class="business-info">
    <p>{{ $business['address'] }}</p>
    <p>Contact: {{ $business['phone'] }}</p>
    <p>Email: {{ $business['email'] }}</p>
</div>

<div class="receipt-footer">
    {{ $business['receipt_footer'] }}
</div>

@endcomponent
