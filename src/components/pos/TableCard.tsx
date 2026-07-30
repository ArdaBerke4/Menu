import type { Table, Order, OrderItem } from '../../types/pos';

interface TableCardProps {
  table: Table;
  orders: Order[];
  orderItems: OrderItem[];
  onClick: (table: Table) => void;
}

export function TableCard({ table, orders, orderItems, onClick }: TableCardProps) {
  const tableOrders = orders.filter(o => o.table_id === table.id);
  const hasActiveOrders = tableOrders.length > 0;

  const pendingCount = tableOrders.filter(o => o.status === 'pending').length;
  const preparingCount = tableOrders.filter(o => o.status === 'preparing').length;
  const readyCount = tableOrders.filter(o => o.status === 'ready').length;

  const totalAmount = tableOrders.reduce((sum, o) => {
    const items = orderItems.filter(i => i.order_id === o.id);
    return sum + items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  }, 0);

  const statusConfig = {
    empty:    { bg: 'bg-white', border: 'border-gray-300', dot: 'bg-gray-300', label: 'Boş' },
    occupied: { bg: 'bg-amber-50', border: 'border-amber-400', dot: 'bg-amber-400', label: 'Dolu' },
    reserved: { bg: 'bg-blue-50', border: 'border-blue-400', dot: 'bg-blue-400', label: 'Rezerve' },
  };

  const effectiveStatus = hasActiveOrders ? 'occupied' : table.status;
  const config = statusConfig[effectiveStatus] || statusConfig.empty;

  return (
    <button
      onClick={() => onClick(table)}
      className={`${config.bg} border-4 ${config.border} p-5 flex flex-col items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0 cursor-pointer text-left w-full relative`}
    >
      {/* Durum noktası */}
      <div className={`absolute top-3 right-3 w-3 h-3 rounded-full ${config.dot} ${hasActiveOrders ? 'animate-pulse' : ''}`} />

      {/* Masa numarası */}
      <div className="text-4xl font-bold text-brand-dark">
        {table.table_number}
      </div>
      <span className="text-sm font-bold text-brand-dark/50 uppercase tracking-wider">
        {table.label || `Masa ${table.table_number}`}
      </span>

      {/* Kapasite */}
      <div className="flex items-center gap-1 text-xs text-brand-dark/40 font-bold">
        {'👤'.repeat(Math.min(table.capacity, 6))}
        {table.capacity > 6 && <span>+{table.capacity - 6}</span>}
      </div>

      {/* Sipariş bilgisi */}
      {hasActiveOrders ? (
        <div className="w-full space-y-1.5 mt-1 border-t border-brand-dark/10 pt-3">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {pendingCount > 0 && (
              <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-0.5 border border-yellow-400">
                {pendingCount} bekliyor
              </span>
            )}
            {preparingCount > 0 && (
              <span className="text-xs font-bold bg-orange-200 text-orange-800 px-2 py-0.5 border border-orange-400">
                {preparingCount} hazırlanıyor
              </span>
            )}
            {readyCount > 0 && (
              <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 border border-green-400">
                {readyCount} hazır
              </span>
            )}
          </div>
          <p className="text-center text-lg font-bold text-brand-dark">
            ₺{totalAmount.toFixed(0)}
          </p>
        </div>
      ) : (
        <div className="mt-1 text-xs font-bold text-brand-dark/30 uppercase">
          {config.label}
        </div>
      )}
    </button>
  );
}
