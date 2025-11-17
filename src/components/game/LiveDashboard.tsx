import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LiveDashboardProps {
  points: number;
  pointsPerSecond: number;
  totalPoints: number;
  currentStreak: number;
  criticalHits: number;
  comboBonus: number;
  dronesCount?: number;
  level: number;
  rank: string;
  className?: string;
}

export default function LiveDashboard({
  points,
  pointsPerSecond,
  totalPoints,
  currentStreak,
  criticalHits,
  comboBonus,
  dronesCount = 0,
  level,
  rank,
  className = ""
}: LiveDashboardProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Puntos Principales */}
      <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-200">Puntos Actuales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              {points.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <Badge variant="outline" className="bg-blue-800/50 text-blue-300 border-blue-500">
                +{pointsPerSecond.toFixed(1)}/s
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total de Puntos */}
      <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-200">Total Acumulado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              {totalPoints.toLocaleString()}
            </div>
            <div className="text-xs text-green-300">
              Recursos totales obtenidos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nivel y Rango */}
      <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-200">Rango</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-xl font-bold text-white">
              {rank}
            </div>
            <div className="text-sm text-purple-300">
              Nivel {level}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drones M.U.L.E. */}
      <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-yellow-200">Drones M.U.L.E.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              {dronesCount}
            </div>
            <div className="text-xs text-yellow-300">
              Generando recursos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de Combate */}
      <Card className="md:col-span-2 bg-gradient-to-br from-red-900 to-red-800 border-red-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-200">Estadísticas de Combate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{currentStreak}</div>
              <div className="text-xs text-red-300">Racha Actual</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{criticalHits}</div>
              <div className="text-xs text-red-300">Críticos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">x{comboBonus.toFixed(1)}</div>
              <div className="text-xs text-red-300">Bonus Combo</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado del Juego */}
      <Card className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-200">Estado del Juego</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Región:</span>
              <Badge variant="outline" className="bg-green-800/50 text-green-300 border-green-500">
                Cyber Concord
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Objetivo:</span>
              <Badge variant="outline" className="bg-blue-800/50 text-blue-300 border-blue-500">
                Escapar a Sanctaris
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Progreso:</span>
              <div className="text-xs text-gray-300">Construcción Ark</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}