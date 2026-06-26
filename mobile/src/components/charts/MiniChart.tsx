import { View } from 'react-native';
import Svg, { Polyline, Defs, LinearGradient, Stop, Polygon } from 'react-native-svg';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export default function MiniChart({ data, width = 80, height = 32, positive = true }: MiniChartProps) {
  if (!data || data.length < 2) return <View style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * w;
    const y = pad + h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const color = positive ? '#22c55e' : '#ef4444';
  const fillPoints = [
    `${pad},${pad + h}`,
    ...points,
    `${pad + w},${pad + h}`,
  ].join(' ');

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Polygon points={fillPoints} fill="url(#grad)" />
      <Polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
