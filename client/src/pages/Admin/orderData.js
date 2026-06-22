export const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export const STATUS_FLOW = {
    'Pending': 'Processing',
    'Processing': 'Shipped',
    'Shipped': 'Delivered',
    'Delivered': null
};

export const STATUS_CONFIG = {
    Pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
    Processing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    Shipped: { bg: 'bg-[#FDF6F3]', text: 'text-[#A96142]', border: 'border-[#A96142]/25', dot: 'bg-[#A96142]' },
    Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

export const ORDERS = [
    {
        id: 'ORD-1021',
        date: new Date().toISOString(),
        status: 'Pending',
        customer: {
            name: 'Meera S.',
            email: 'meera@example.com',
            phone: '+91 98765 43210',
            address: {
                line1: '12A, Sea View Apartments',
                line2: 'Marine Drive',
                city: 'Mumbai',
                state: 'Maharashtra',
                pin: '400020'
            }
        },
        items: [
            {
                name: 'Polo Collar Tee',
                size: 'M',
                color: 'White',
                qty: 1,
                price: 720,
                img: 'https://images.unsplash.com/photo-1671438118097-479e63198629?q=80&w=200&auto=format&fit=crop'
            }
        ]
    },
    {
        id: 'ORD-1020',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'Processing',
        customer: {
            name: 'Rahul K.',
            email: 'rahul.k@example.com',
            phone: '+91 98765 12345',
            address: {
                line1: 'Flat 402, Block B',
                line2: 'Greenfield Residency',
                city: 'Bengaluru',
                state: 'Karnataka',
                pin: '560102'
            }
        },
        items: [
            {
                name: 'Striped Boatneck Tee',
                size: 'L',
                color: 'Navy',
                qty: 2,
                price: 680,
                img: 'https://images.unsplash.com/photo-1660924173457-5b9198c9c867?q=80&w=200&auto=format&fit=crop'
            }
        ]
    }
];
