import { EstimateBuilderProvider } from '@/context/EstimateBuilderContext';
import EstimateBuilderChip from './_components/EstimateBuilderChip';

export default function EstimateLayout({ children }: { children: React.ReactNode }) {
  return (
    <EstimateBuilderProvider>
      {children}
      <EstimateBuilderChip />
    </EstimateBuilderProvider>
  );
}
