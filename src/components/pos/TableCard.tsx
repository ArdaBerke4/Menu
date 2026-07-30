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

  const pendingCount = orderItems.filter(i => 
    i.status === 'pending' && tableOrders.some(o => o.id === i.order_id)
  ).length;

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
  const isCallingWaiter = table.needs_waiter;

  const finalBg = isCallingWaiter ? 'bg-red-50' : config.bg;
  const finalBorder = isCallingWaiter ? 'border-red-500 animate-pulse' : config.border;

  return (
    <button
      onClick={() => onClick(table)}
      className={`${finalBg} border-4 ${finalBorder} p-5 flex flex-col items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg active:translate-y-0 cursor-pointer text-left w-full relative`}
    >
      {/* Garson Uyarı Etiketi */}
      {isCallingWaiter && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 whitespace-nowrap border-2 border-black z-10 animate-bounce">
          🔔 GARSON ÇAĞRILDI
        </div>
      )}

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
