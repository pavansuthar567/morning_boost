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
import { Alert, VirtualTrade, Charges } from '@/types';
import { useUIStore } from '@/store';
import { useAuth } from '@/context/AuthContext';

interface TradesTableProps {
  trades: VirtualTrade[];
  isLoading?: boolean;
  showNetPnl?: boolean;
  isReadOnly?: boolean;
}

export default function TradesTable({ trades, isLoading, showNetPnl = false, isReadOnly = false }: TradesTableProps) {
  const { openTradeDetail } = useUIStore();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canDebug = isAdmin && !isReadOnly;
  const [debugTrade, setDebugTrade] = useState<VirtualTrade | null>(null);
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

  const formatCharge = (val: number) => `₹${val.toFixed(2)}`;

  const formatOptionalPrice = (val?: number | null) => {
    if (val === undefined || val === null || Number.isNaN(val)) return '-';
    return `₹${val.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    return status === 'OPEN' ? 'warning' : 'success';
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-500';
    if (pnl < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getExitReasonColor = (reason?: string) => {
    switch (reason) {
      case 'TARGET':
        return 'success';
      case 'SL':
        return 'error';
      case 'MANUAL':
        return 'warning';
      case 'SQUARE_OFF':
        return 'info';
      case 'AUTO':
        return 'primary';
      default:
        return 'light';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-500">Loading trades...</span>
      </div>
    );
  }

  if (!trades || trades.length === 0) {
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
        <p className="text-lg font-medium">No trades found</p>
        <p className="text-sm">Trades will appear here once executed</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1300px]">
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
                  Strategy
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Direction
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
                  Entry Price
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Exit Price
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
                  Qty
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
                  Exit Reason
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Entry Time
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Exit Time
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {trades.map((trade) => (
                <TableRow
                  key={trade._id}
                  className={`${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}
                  onClick={isReadOnly ? undefined : () => openTradeDetail(trade._id)}
                >
                  <TableCell className="px-5 py-4 text-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span 
                          className={`font-semibold text-gray-800 text-theme-sm dark:text-white/90 ${canDebug ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                          onClick={(e) => {
                            if (canDebug) {
                              e.stopPropagation();
                              setDebugTrade(trade);
                            }
                          }}
                          title={canDebug ? 'Click to view JSON' : undefined}
                        >
                          {(trade.strategy?.alert as Alert)?.symbol || 'N/A'}
                        </span>
                        {trade.entryOrder?.isIlliquid && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded dark:bg-orange-900/30 dark:text-orange-400" title="Price may be unreliable">
                            ⚠️ Illiquid
                          </span>
                        )}
                      </div>
                      {trade.entryOrder?.expiryDate && (
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          Exp: {new Date(trade.entryOrder.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, ' ')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start">
                    <div>
                      {trade.strategy?._id && !isReadOnly ? (
                        <Link
                          href={`/strategies/${trade.strategy._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block font-medium text-blue-600 hover:text-blue-800 hover:underline text-theme-sm dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {trade.strategy?.name || 'N/A'}
                        </Link>
                      ) : (
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {trade.strategy?.name || 'N/A'}
                        </span>
                      )}
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {trade.strategy?.instrumentType || ''} • {trade.strategy?.optionType || ''} • {(trade.strategy?.alert as Alert)?.timeframe || '-'}min
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge
                      size="sm"
                      color={trade.direction === 'LONG' ? 'success' : 'error'}
                    >
                      {trade.direction}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {trade.entryOrder?.side ? (
                      <Badge size="sm" color={trade.entryOrder.side === 'CE' ? 'success' : 'error'}>
                        {trade.entryOrder.side}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                    {trade.entryOrder?.spotPriceAtEntry ? `₹${trade.entryOrder.spotPriceAtEntry.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                    {trade.entryOrder?.strike ? `₹${trade.entryOrder.strike}` : '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                    ₹{trade.entryOrder?.price?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                    {trade.exitOrder ? `₹${trade.exitOrder.price?.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-xs">
                    {trade.entryOrder?.target != null ||
                    trade.entryOrder?.sl != null ||
                    trade.entryOrder?.trailingJump != null ? (
                      <div className="space-y-0.5">
                        {trade.entryOrder?.target != null && (
                          <div className="text-green-600">
                            {formatOptionalPrice(trade.entryOrder?.target)}
                          </div>
                        )}
                        {trade.entryOrder?.sl != null && (
                          <div className="text-red-500">
                            {formatOptionalPrice(trade.entryOrder?.sl)}
                          </div>
                        )}
                        {trade.entryOrder?.trailingJump != null && (
                          <div className="text-blue-600">
                            TJ {formatOptionalPrice(trade.entryOrder?.trailingJump)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-700 text-start text-theme-sm dark:text-gray-300">
                    {trade.entryOrder?.qty || 0}
                  </TableCell>
                  <TableCell className={`px-4 py-3 text-start text-theme-sm font-semibold relative ${getPnLColor(showNetPnl && trade.netPnl !== undefined ? trade.netPnl : trade.pnl)}`}>
                    <span
                      className={trade.charges ? 'cursor-help border-b border-dashed border-current' : ''}
                      onMouseEnter={(e) => {
                        if (trade.charges) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const showBelow = rect.top < 300;
                          setHoveredCharges({ 
                            id: trade._id, 
                            charges: trade.charges, 
                            showBelow,
                            position: { top: showBelow ? rect.bottom + 8 : rect.top - 8, left: rect.left }
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredCharges(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (trade.charges) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const showBelow = rect.top < 300;
                          setHoveredCharges(prev => 
                            prev?.id === trade._id ? null : { 
                              id: trade._id, 
                              charges: trade.charges!, 
                              showBelow,
                              position: { top: showBelow ? rect.bottom + 8 : rect.top - 8, left: rect.left }
                            }
                          );
                        }
                      }}
                    >
                      {formatPnL(showNetPnl && trade.netPnl !== undefined ? trade.netPnl : trade.pnl)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    <Badge size="sm" color={getStatusColor(trade.status)}>
                      {trade.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start">
                    {trade.exitReason ? (
                      <Badge size="sm" color={getExitReasonColor(trade.exitReason)}>
                        {trade.exitReason}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    {formatDate(trade.entryTime)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    {trade.exitTime ? formatDate(trade.exitTime) : '-'}
                  </TableCell>
                </TableRow>
              ))}
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
            const trade = trades.find(t => t._id === hoveredCharges.id);
            if (!trade) return null;
            return (
              <>
                <div className={`flex justify-between mb-2 pb-2 border-b border-gray-700 font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <span>Gross P&L:</span><span>{formatPnL(trade.pnl)}</span>
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
                <div className={`flex justify-between mt-2 pt-2 border-t border-gray-600 font-bold ${(trade.netPnl ?? trade.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <span>Net P&L:</span><span>{formatPnL(trade.netPnl ?? trade.pnl)}</span>
                </div>
              </>
            );
          })()}
          </div>
        </>
      )}

      {/* Admin Debug Modal */}
      {isAdmin && debugTrade && (
        <div 
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50"
          onClick={() => setDebugTrade(null)}
        >
          <div 
            className="relative max-w-2xl w-full max-h-[80vh] m-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                🔧 Trade Debug JSON
              </h3>
              <button
                onClick={() => setDebugTrade(null)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh]">
              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded">
                {JSON.stringify(debugTrade, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

