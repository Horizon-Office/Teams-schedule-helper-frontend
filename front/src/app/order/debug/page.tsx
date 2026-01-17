"use client";

import { useEffect, useState } from 'react';

export default function DebugPage() {
	const [orders, setOrders] = useState<any[]>([]);

	useEffect(() => {
		fetch('/api/orders')
			.then(res => res.json())
			.then(data => setOrders(data));
	}, []);

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">Debug Orders Storage</h1>
			<p>Total orders: {orders.length}</p>
			<div className="mt-4">
				{orders.map(order => (
					<div key={order.id} className="border p-4 mb-2">
						<p><strong>ID:</strong> {order.id}</p>
						<p><strong>Name:</strong> {order.fileName}</p>
						<p><strong>Date:</strong> {new Date(order.uploadDate).toLocaleString()}</p>
						<a
							href={`/order/${order.id}`}
							className="text-blue-500 hover:underline"
						>
							Open this order
						</a>
					</div>
				))}
			</div>
		</div>
	);
}