'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';
import Badge from '../ui/badge/Badge';
import { VirtualOrder, Alert, Charges } from '@/types';
import { useUIStore } from '@/store';
import { useAuth } from '@/context/AuthContext';

interface OrdersTableProps {
  orders: VirtualOrder[];
  isLoading?: boolean;
  showNetPnl?: boolean;
}

export default function OrdersTable({ orders, isLoading, showNetPnl = false }: OrdersTableProps) {
  const { openOrderDetail } = useUIStore();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [debugOrder, setDebugOrder] = useState<VirtualOrder | null>(null);
  const [hoveredCharges, setHoveredCharges] = useState<{ id: string; charges: Charges; showBelow: boolean; position: { top: number; left: number } } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPnL = (pnl: number) => {
    const formatted = pnl.toFixed(2);
    return pnl >= 0 ? `+₹${formatted}` : `-₹${Math.abs(pnl).toFixed(2)}`;
  };

  const formatOptionalPrice = (val?: number | null) => {
    if (val === undefined || val === null || Number.isNaN(val)) return '-';
    return `₹${val.toFixed(2)}`;
  };

  const formatCharge = (val: number) => `₹${val.toFixed(2)}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TRADED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'REJECTED':
        return 'error';
      default:
        return 'light';
    }
  };

  const getTransactionColor = (type: string) => {
    return type === 'BUY' ? 'success' : 'error';
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-500';
    if (pnl < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-500">Loading orders...</span>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg
          className="w-16 h-16 mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-lg font-medium">No orders found</p>
        <p className="text-sm">Orders will appear here once executed</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1400px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Symbol
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Order ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Strategy
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Type
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Side
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Spot Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Strike
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Qty
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Tgt/SL
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  P&L
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Time
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {orders.map((order) => {
                const trailingJump = (order as { trailingJump?: number }).trailingJump;
                return (
                <TableRow
                  key={order._id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  onClick={() => openOrderDetail(order._id)}
                >
                  <TableCell className="px-5 py-4 text-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                          {typeof order.strategy === 'object' ? (order.strategy.alert as Alert)?.symbol || 'N/A' : 'N/A'}
                        </span>
                        {order.isIlliquid && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded dark:bg-orange-900/30 dark:text-orange-400" title="Price may be unreliable">
                            ⚠️ Illiquid
                          </span>
                        )}
                      </div>
                      {order.expiryDate && (
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          Exp: {new Date(order.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, ' ')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <span 
                      className={`font-mono text-xs text-gray-600 dark:text-gray-400 ${isAdmin ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                      title={isAdmin ? order.orderId : undefined}
                      onClick={(e) => {
                        if (isAdmin) {
                          e.stopPropagation();
                          setDebugOrder(order);
                        }
                      }}
                    >
                      {order.orderId.substring(0, 20)}...
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {typeof order.strategy === 'object' && order.strategy._id ? (
                      <Link
                        href={`/strategies/${order.strategy._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {order.strategy.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-800 dark:text-white/90">
                        {typeof order.strategy === 'object' ? order.strategy.name : 'N/A'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge size="sm" color={getTransactionColor(order.transactionType)}>
                      {order.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {order.side ? (
                      <Badge size="sm" color={order.side === 'CE' ? 'success' : 'error'}>
                        {order.side}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                    {order.spotPriceAtEntry ? `₹${order.spotPriceAtEntry.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                    {order.strike ? `₹${order.strike}` : '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                    {order.qty}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                    ₹{order.price?.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-xs">
                    {order.target != null || order.sl != null || trailingJump != null ? (
                      <div className="space-y-0.5">
                        {order.target != null && (
                          <div className="text-green-600">
                            {formatOptionalPrice(order.target)}
                          </div>
                        )}
                        {order.sl != null && (
                          <div className="text-red-500">
                            {formatOptionalPrice(order.sl)}
                          </div>
                        )}
                        {trailingJump != null && (
                          <div className="text-blue-600">
                            TJ {formatOptionalPrice(trailingJump)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className={`px-4 py-3 text-start text-theme-sm font-semibold relative ${getPnLColor(showNetPnl && order.netPnl !== undefined ? order.netPnl : order.pnl)}`}>
                    <span
                      className={order.charges ? 'cursor-help border-b border-dashed border-current' : ''}
                      onMouseEnter={(e) => {
                        if (order.charges) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const showBelow = rect.top < 300;
                          setHoveredCharges({ 
                            id: order._id, 
                            charges: order.charges, 
                            showBelow,
                            position: { top: showBelow ? rect.bottom + 8 : rect.top - 8, left: rect.left }
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredCharges(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (order.charges) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const showBelow = rect.top < 300;
                          setHoveredCharges(prev => 
                            prev?.id === order._id ? null : { 
                              id: order._id, 
                              charges: order.charges!, 
                              showBelow,
                              position: { top: showBelow ? rect.bottom + 8 : rect.top - 8, left: rect.left }
                            }
                          );
                        }
                      }}
                    >
                      {formatPnL(showNetPnl && order.netPnl !== undefined ? order.netPnl : order.pnl)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge size="sm" color={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    {formatDate(order.entryTime)}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Fixed Charges Tooltip */}
      {hoveredCharges && (
        <>
          {/* Backdrop for touch dismiss */}
          <div 
            className="fixed inset-0 z-[9998] md:hidden" 
            onClick={() => setHoveredCharges(null)}
          />
          <div 
            className="fixed z-[9999] p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl min-w-[200px]"
            style={{ 
              top: hoveredCharges.showBelow ? hoveredCharges.position.top : 'auto',
              bottom: hoveredCharges.showBelow ? 'auto' : `calc(100vh - ${hoveredCharges.position.top}px)`,
              left: Math.min(hoveredCharges.position.left, window.innerWidth - 220),
              transform: 'translateX(-20%)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
          {(() => {
            const order = orders.find(o => o._id === hoveredCharges.id);
            if (!order) return null;
            return (
              <>
                <div className={`flex justify-between mb-2 pb-2 border-b border-gray-700 font-semibold ${order.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <span>Gross P&L:</span><span>{formatPnL(order.pnl)}</span>
                </div>
                <div className="font-semibold mb-1.5 text-gray-400 text-[10px] uppercase tracking-wide">Charges</div>
                <div className="space-y-1 text-gray-300">
                  <div className="flex justify-between"><span>Brokerage:</span><span>{formatCharge(hoveredCharges.charges.brokerage)}</span></div>
                  <div className="flex justify-between"><span>STT:</span><span>{formatCharge(hoveredCharges.charges.stt)}</span></div>
                  <div className="flex justify-between"><span>Exchange Txn:</span><span>{formatCharge(hoveredCharges.charges.exchangeTxn)}</span></div>
                  <div className="flex justify-between"><span>SEBI:</span><span>{formatCharge(hoveredCharges.charges.sebi)}</span></div>
                  <div className="flex justify-between"><span>Stamp Duty:</span><span>{formatCharge(hoveredCharges.charges.stampDuty)}</span></div>
                  <div className="flex justify-between"><span>GST:</span><span>{formatCharge(hoveredCharges.charges.gst)}</span></div>
                  <div className="flex justify-between pt-1 mt-1 border-t border-gray-700 text-orange-400">
                    <span>Total Charges:</span><span>{formatCharge(hoveredCharges.charges.total)}</span>
                  </div>
                </div>
                <div className={`flex justify-between mt-2 pt-2 border-t border-gray-600 font-bold ${(order.netPnl ?? order.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <span>Net P&L:</span><span>{formatPnL(order.netPnl ?? order.pnl)}</span>
                </div>
              </>
            );
          })()}
          </div>
        </>
      )}

      {/* Admin Debug Modal */}
      {isAdmin && debugOrder && (
        <div 
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50"
          onClick={() => setDebugOrder(null)}
        >
          <div 
            className="relative max-w-2xl w-full max-h-[80vh] m-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                🔧 Order Debug JSON
              </h3>
              <button
                onClick={() => setDebugOrder(null)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh]">
              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded">
                {JSON.stringify(debugOrder, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

